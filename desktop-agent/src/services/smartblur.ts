import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js';

interface SensitiveRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  confidence?: number;
  matchedPattern?: string;
}

interface BlurResult {
  processedPath: string;
  regionsBlurred: number;
  sensitiveTypes: string[];
  ocrProcessed: boolean;
  skippedByWhitelist: number;
}

interface OCRWord {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

interface SmartBlurConfig {
  whitelist: string[];
  whitelistApps: string[];
}

export class SmartBlurService {
  private static ocrWorker: Tesseract.Worker | null = null;
  private static ocrInitializing: boolean = false;
  private static config: SmartBlurConfig = { whitelist: [], whitelistApps: [] };

  // Patterns for sensitive data detection
  private static readonly SENSITIVE_PATTERNS: Record<string, RegExp> = {
    creditCard: /\b(?:\d{4}[\s-]?){3}\d{4}\b/,
    cvv: /\b(?:cvv|cvc|cv2)[\s:]*\d{3,4}\b/i,
    cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
    cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/,
    bankAccount: /\b(?:conta|account|ag[eê]ncia|agency|routing)[\s:]*[\d-]{4,}/i,
    apiKey: /\b(?:sk_live_|pk_live_|api[_-]?key|apikey|access[_-]?token|bearer|secret[_-]?key)[\s:]*[\w-]{10,}/i,
    passwordField: /(?:senha|password|secret|pin|passcode|pwd)[\s:]+[\S]{4,}/i,
    emailPassword: /(?:email|e-mail|login)[\s:]+[\w@.-]+[\s\n]+(?:senha|password|pwd)[\s:]+/i,
    privateKey: /-----BEGIN.*PRIVATE KEY-----/i,
    awsCredential: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    genericToken: /\b(?:token|bearer|auth)[\s:]+[a-zA-Z0-9_-]{20,}\b/i,
    phoneNumber: /\b(?:\+\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}\b/,
    dateOfBirth: /(?:nascimento|birth|dob|data[\s]de[\s]nasc)[\s:]+\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/i,
  };

  private static readonly SENSITIVE_WINDOW_TITLES = [
    /password/i, /senha/i, /bank/i, /banco/i, /credit/i, /crédito/i,
    /payment/i, /pagamento/i, /login/i, /sign.?in/i, /wallet/i,
    /carteira/i, /account/i, /conta/i, /checkout/i, /billing/i,
  ];

  private static readonly SENSITIVE_APPS = [
    'keepass', 'lastpass', '1password', 'bitwarden', 'dashlane',
    'keychain', 'credential', 'vault', 'authenticator', 'keyring',
  ];

  private static readonly SENSITIVE_KEYWORDS = [
    'password', 'senha', 'secret', 'confidential', 'private',
    'credit card', 'cartão', 'cvv', 'cvc', 'pin', 'ssn', 'cpf', 'cnpj',
    'bank account', 'conta bancária', 'routing number', 'api key',
    'access token', 'bearer', 'authorization', 'auth token',
  ];

  /**
   * Configure whitelist settings
   */
  static setConfig(config: SmartBlurConfig): void {
    this.config = config;
    console.log(`SmartBlur: Configured with ${config.whitelist.length} whitelisted words, ${config.whitelistApps.length} whitelisted apps`);
  }

  /**
   * Check if text matches any whitelist entry
   */
  private static isWhitelisted(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.config.whitelist.some(item => {
      const lowerItem = item.toLowerCase();
      // Support wildcard matching with *
      if (lowerItem.includes('*')) {
        const regex = new RegExp('^' + lowerItem.replace(/\*/g, '.*') + '$', 'i');
        return regex.test(lowerText);
      }
      return lowerText.includes(lowerItem);
    });
  }

  /**
   * Check if app is whitelisted (skip processing entirely)
   */
  private static isAppWhitelisted(appName?: string): boolean {
    if (!appName) return false;
    const lowerApp = appName.toLowerCase();
    return this.config.whitelistApps.some(item => 
      lowerApp.includes(item.toLowerCase())
    );
  }

  /**
   * Initialize OCR worker
   */
  private static async initOCR(): Promise<Tesseract.Worker> {
    if (this.ocrWorker) {
      return this.ocrWorker;
    }

    if (this.ocrInitializing) {
      // Wait for initialization to complete
      while (this.ocrInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.ocrWorker!;
    }

    this.ocrInitializing = true;

    try {
      console.log('SmartBlur: Initializing OCR worker...');
      this.ocrWorker = await Tesseract.createWorker('eng+por', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Only log progress at 25% intervals
            if (m.progress && (m.progress * 100) % 25 < 1) {
              console.log(`SmartBlur OCR: ${Math.round(m.progress * 100)}%`);
            }
          }
        },
      });

      console.log('SmartBlur: OCR worker initialized');
      return this.ocrWorker;
    } finally {
      this.ocrInitializing = false;
    }
  }

  /**
   * Process an image with OCR and blur sensitive regions
   */
  static async processImage(
    imagePath: string,
    windowTitle?: string,
    appName?: string
  ): Promise<BlurResult> {
    const sensitiveTypes: string[] = [];
    const regions: SensitiveRegion[] = [];
    let ocrProcessed = false;
    let skippedByWhitelist = 0;

    // Check if app is whitelisted - skip processing entirely
    if (this.isAppWhitelisted(appName)) {
      console.log(`SmartBlur: Skipping ${appName} (whitelisted app)`);
      return {
        processedPath: imagePath,
        regionsBlurred: 0,
        sensitiveTypes: [],
        ocrProcessed: false,
        skippedByWhitelist: 0,
      };
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
      }

      // Check if window title is whitelisted
      if (windowTitle && this.isWhitelisted(windowTitle)) {
        console.log(`SmartBlur: Skipping window "${windowTitle}" (whitelisted)`);
        return {
          processedPath: imagePath,
          regionsBlurred: 0,
          sensitiveTypes: [],
          ocrProcessed: false,
          skippedByWhitelist: 1,
        };
      }

      // Check if window title or app suggests sensitive content
      const isSensitiveContext = this.isSensitiveContext(windowTitle, appName);

      if (isSensitiveContext) {
        sensitiveTypes.push('sensitive_context');
        const passwordRegions = this.getCommonPasswordFieldRegions(metadata.width, metadata.height);
        regions.push(...passwordRegions);
      }

      // Perform OCR to detect text
      try {
        const ocrResult = await this.performOCRAndDetect(imageBuffer, metadata);
        if (ocrResult.regions.length > 0) {
          regions.push(...ocrResult.regions);
          ocrProcessed = true;
          skippedByWhitelist += ocrResult.skippedByWhitelist;
          
          ocrResult.regions.forEach(r => {
            if (r.type && !sensitiveTypes.includes(r.type)) {
              sensitiveTypes.push(r.type);
            }
          });
        }
      } catch (ocrError) {
        console.error('SmartBlur OCR error:', ocrError);
      }

      // If no regions to blur, return original
      if (regions.length === 0) {
        return {
          processedPath: imagePath,
          regionsBlurred: 0,
          sensitiveTypes: [],
          ocrProcessed,
          skippedByWhitelist,
        };
      }

      // Merge overlapping regions
      const mergedRegions = this.mergeOverlappingRegions(regions);

      // Apply blur to detected regions
      const processedImage = await this.applyBlurToRegions(imageBuffer, mergedRegions, metadata);

      // Save processed image
      const outputFilename = `blurred_${uuidv4()}.png`;
      const outputPath = path.join(os.tmpdir(), outputFilename);
      await processedImage.toFile(outputPath);

      // Clean up original
      if (outputPath !== imagePath) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {}
      }

      console.log(`SmartBlur: Processed ${mergedRegions.length} regions, skipped ${skippedByWhitelist} whitelisted, OCR: ${ocrProcessed}`);

      return {
        processedPath: outputPath,
        regionsBlurred: mergedRegions.length,
        sensitiveTypes,
        ocrProcessed,
        skippedByWhitelist,
      };
    } catch (error) {
      console.error('SmartBlur processing error:', error);
      return {
        processedPath: imagePath,
        regionsBlurred: 0,
        sensitiveTypes: [],
        ocrProcessed: false,
        skippedByWhitelist: 0,
      };
    }
  }

  /**
   * Perform OCR and detect sensitive text regions
   */
  private static async performOCRAndDetect(
    imageBuffer: Buffer,
    metadata: sharp.Metadata
  ): Promise<{ regions: SensitiveRegion[]; skippedByWhitelist: number }> {
    const regions: SensitiveRegion[] = [];
    let skippedByWhitelist = 0;

    try {
      const worker = await this.initOCR();
      const result = await worker.recognize(imageBuffer);
      
      if (!result.data.words || result.data.words.length === 0) {
        return { regions, skippedByWhitelist };
      }

      // Process each word
      for (const word of result.data.words) {
        const wordText = word.text.trim();
        if (!wordText || wordText.length < 3) continue;

        // Check whitelist first
        if (this.isWhitelisted(wordText)) {
          skippedByWhitelist++;
          continue;
        }

        // Check against sensitive patterns
        let matched = false;
        for (const [patternName, pattern] of Object.entries(this.SENSITIVE_PATTERNS)) {
          if (pattern.test(wordText)) {
            regions.push({
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0,
              type: `ocr_${patternName}`,
              confidence: word.confidence,
              matchedPattern: patternName,
            });
            matched = true;
            break;
          }
        }

        if (matched) continue;

        // Check for sensitive keywords
        const lowerWord = wordText.toLowerCase();
        for (const keyword of this.SENSITIVE_KEYWORDS) {
          // Skip if keyword is whitelisted
          if (this.isWhitelisted(keyword)) {
            skippedByWhitelist++;
            continue;
          }
          
          if (lowerWord.includes(keyword.toLowerCase())) {
            regions.push({
              x: Math.max(0, word.bbox.x0 - 50),
              y: Math.max(0, word.bbox.y0 - 10),
              width: Math.min((word.bbox.x1 - word.bbox.x0) + 200, metadata.width! - word.bbox.x0),
              height: (word.bbox.y1 - word.bbox.y0) + 20,
              type: 'ocr_keyword',
              confidence: word.confidence,
              matchedPattern: keyword,
            });
            break;
          }
        }
      }

      // Check full text for multi-word patterns
      const fullText = result.data.text;
      for (const [patternName, pattern] of Object.entries(this.SENSITIVE_PATTERNS)) {
        let match;
        const globalPattern = new RegExp(pattern.source, 'gi');
        while ((match = globalPattern.exec(fullText)) !== null) {
          const matchedText = match[0];
          
          // Skip if whitelisted
          if (this.isWhitelisted(matchedText)) {
            skippedByWhitelist++;
            continue;
          }
          
          const matchStart = match.index;
          const linesBefore = fullText.substring(0, matchStart).split('\n').length - 1;
          const estimatedY = Math.min(linesBefore * 25 + 50, metadata.height! - 50);
          
          regions.push({
            x: Math.floor(metadata.width! * 0.1),
            y: estimatedY,
            width: Math.floor(metadata.width! * 0.8),
            height: 40,
            type: `ocr_multiword_${patternName}`,
            matchedPattern: patternName,
          });
        }
      }

      return { regions, skippedByWhitelist };
    } catch (error) {
      console.error('OCR detection error:', error);
      return { regions, skippedByWhitelist };
    }
  }

  /**
   * Check if the context (window/app) suggests sensitive content
   */
  private static isSensitiveContext(windowTitle?: string, appName?: string): boolean {
    if (windowTitle) {
      for (const pattern of this.SENSITIVE_WINDOW_TITLES) {
        if (pattern.test(windowTitle)) {
          return true;
        }
      }
    }

    if (appName) {
      const lowerAppName = appName.toLowerCase();
      for (const sensitiveApp of this.SENSITIVE_APPS) {
        if (lowerAppName.includes(sensitiveApp)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get common password field regions based on typical UI layouts
   */
  private static getCommonPasswordFieldRegions(width: number, height: number): SensitiveRegion[] {
    const regions: SensitiveRegion[] = [];
    const centerX = Math.floor(width * 0.2);
    const centerWidth = Math.floor(width * 0.6);
    
    const yPositions = [0.35, 0.45, 0.55, 0.65];
    
    for (const yPercent of yPositions) {
      regions.push({
        x: centerX,
        y: Math.floor(height * yPercent) - 20,
        width: centerWidth,
        height: 50,
        type: 'password_field_area',
      });
    }

    return regions;
  }

  /**
   * Merge overlapping regions to avoid double-blurring
   */
  private static mergeOverlappingRegions(regions: SensitiveRegion[]): SensitiveRegion[] {
    if (regions.length <= 1) return regions;

    const merged: SensitiveRegion[] = [];
    const used = new Set<number>();

    for (let i = 0; i < regions.length; i++) {
      if (used.has(i)) continue;

      let current = { ...regions[i] };
      used.add(i);

      // Find all overlapping regions
      let foundOverlap = true;
      while (foundOverlap) {
        foundOverlap = false;
        for (let j = 0; j < regions.length; j++) {
          if (used.has(j)) continue;

          if (this.regionsOverlap(current, regions[j])) {
            // Merge regions
            const minX = Math.min(current.x, regions[j].x);
            const minY = Math.min(current.y, regions[j].y);
            const maxX = Math.max(current.x + current.width, regions[j].x + regions[j].width);
            const maxY = Math.max(current.y + current.height, regions[j].y + regions[j].height);

            current = {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
              type: current.type,
            };

            used.add(j);
            foundOverlap = true;
          }
        }
      }

      merged.push(current);
    }

    return merged;
  }

  /**
   * Check if two regions overlap
   */
  private static regionsOverlap(a: SensitiveRegion, b: SensitiveRegion): boolean {
    const padding = 20; // Allow some padding for near-overlaps
    return !(
      a.x + a.width + padding < b.x ||
      b.x + b.width + padding < a.x ||
      a.y + a.height + padding < b.y ||
      b.y + b.height + padding < a.y
    );
  }

  /**
   * Apply blur to specified regions in the image
   */
  private static async applyBlurToRegions(
    imageBuffer: Buffer,
    regions: SensitiveRegion[],
    metadata: sharp.Metadata
  ): Promise<sharp.Sharp> {
    const width = metadata.width!;
    const height = metadata.height!;
    const composites: sharp.OverlayOptions[] = [];

    for (const region of regions) {
      const safeX = Math.max(0, Math.min(region.x, width - 1));
      const safeY = Math.max(0, Math.min(region.y, height - 1));
      const safeWidth = Math.min(region.width, width - safeX);
      const safeHeight = Math.min(region.height, height - safeY);

      if (safeWidth <= 0 || safeHeight <= 0) continue;

      try {
        const regionBuffer = await sharp(imageBuffer)
          .extract({
            left: safeX,
            top: safeY,
            width: safeWidth,
            height: safeHeight,
          })
          .blur(30) // Strong blur for better privacy
          .toBuffer();

        composites.push({
          input: regionBuffer,
          left: safeX,
          top: safeY,
        });
      } catch (e) {
        console.error(`Error processing region at (${safeX}, ${safeY}):`, e);
      }
    }

    if (composites.length > 0) {
      return sharp(imageBuffer).composite(composites);
    }

    return sharp(imageBuffer);
  }

  /**
   * Cleanup OCR worker when shutting down
   */
  static async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      try {
        await this.ocrWorker.terminate();
        this.ocrWorker = null;
        console.log('SmartBlur: OCR worker terminated');
      } catch (e) {
        console.error('Error terminating OCR worker:', e);
      }
    }
  }
}
