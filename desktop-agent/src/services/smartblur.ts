import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

interface SensitiveRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

interface BlurResult {
  processedPath: string;
  regionsBlurred: number;
  sensitiveTypes: string[];
}

export class SmartBlurService {
  // Patterns for sensitive data detection
  private static readonly SENSITIVE_PATTERNS = {
    // Credit card patterns (16 digits with optional separators)
    creditCard: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    // CPF pattern (Brazilian ID)
    cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
    // CNPJ pattern (Brazilian company ID)
    cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
    // SSN pattern (US)
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    // Bank account patterns
    bankAccount: /\b(?:conta|account|ag[eê]ncia|agency)[\s:]*\d{4,}/gi,
    // API keys and tokens (generic patterns)
    apiKey: /\b(?:sk_live_|pk_live_|api_key|apikey|access_token|bearer)[\w-]{20,}/gi,
    // Password fields indicators
    passwordField: /(?:senha|password|secret|pin|cvv|cvc|pwd)[\s:]+/gi,
  };

  // Window title patterns that indicate sensitive content
  private static readonly SENSITIVE_WINDOW_TITLES = [
    /password/i,
    /senha/i,
    /bank/i,
    /banco/i,
    /credit/i,
    /crédito/i,
    /payment/i,
    /pagamento/i,
    /login/i,
    /sign.?in/i,
    /wallet/i,
    /carteira/i,
    /account/i,
    /conta/i,
  ];

  // App names that typically contain sensitive data
  private static readonly SENSITIVE_APPS = [
    'keepass', 'lastpass', '1password', 'bitwarden', 'dashlane',
    'keychain', 'credential', 'vault', 'authenticator',
  ];

  /**
   * Process an image and blur sensitive regions
   */
  static async processImage(
    imagePath: string,
    windowTitle?: string,
    appName?: string
  ): Promise<BlurResult> {
    const sensitiveTypes: string[] = [];
    let regionsBlurred = 0;

    try {
      // Read the image
      const imageBuffer = fs.readFileSync(imagePath);
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
      }

      const regions: SensitiveRegion[] = [];

      // Check if window title or app suggests sensitive content
      const isSensitiveContext = this.isSensitiveContext(windowTitle, appName);

      if (isSensitiveContext) {
        sensitiveTypes.push('sensitive_context');
        
        // Add blur regions for common password field locations
        // Typically password fields are in the center-ish area
        const passwordRegions = this.getCommonPasswordFieldRegions(metadata.width, metadata.height);
        regions.push(...passwordRegions);
        regionsBlurred += passwordRegions.length;
      }

      // Detect potential input fields (darker rectangles with text)
      const inputFieldRegions = await this.detectInputFields(imageBuffer, metadata);
      if (inputFieldRegions.length > 0) {
        sensitiveTypes.push('input_fields');
        regions.push(...inputFieldRegions);
        regionsBlurred += inputFieldRegions.length;
      }

      // If no regions to blur, return original
      if (regions.length === 0) {
        return {
          processedPath: imagePath,
          regionsBlurred: 0,
          sensitiveTypes: [],
        };
      }

      // Apply blur to detected regions
      const processedImage = await this.applyBlurToRegions(imageBuffer, regions, metadata);

      // Save processed image
      const outputFilename = `blurred_${uuidv4()}.png`;
      const outputPath = path.join(os.tmpdir(), outputFilename);
      await processedImage.toFile(outputPath);

      // Clean up original if different path
      if (outputPath !== imagePath) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      console.log(`SmartBlur: Processed ${regionsBlurred} regions, types: ${sensitiveTypes.join(', ')}`);

      return {
        processedPath: outputPath,
        regionsBlurred,
        sensitiveTypes,
      };
    } catch (error) {
      console.error('SmartBlur processing error:', error);
      // Return original on error
      return {
        processedPath: imagePath,
        regionsBlurred: 0,
        sensitiveTypes: [],
      };
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

    // Center area (common for login dialogs)
    const centerX = Math.floor(width * 0.25);
    const centerWidth = Math.floor(width * 0.5);
    
    // Multiple vertical positions where password fields typically appear
    const yPositions = [0.35, 0.45, 0.55, 0.65]; // 35%, 45%, 55%, 65% of height
    
    for (const yPercent of yPositions) {
      regions.push({
        x: centerX,
        y: Math.floor(height * yPercent) - 20,
        width: centerWidth,
        height: 50, // Typical input field height
        type: 'password_field_area',
      });
    }

    return regions;
  }

  /**
   * Detect potential input fields using image analysis
   */
  private static async detectInputFields(
    imageBuffer: Buffer,
    metadata: sharp.Metadata
  ): Promise<SensitiveRegion[]> {
    const regions: SensitiveRegion[] = [];

    try {
      // Convert to grayscale for analysis
      const grayscale = await sharp(imageBuffer)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = grayscale;
      const { width, height } = info;

      // Scan for potential input fields (horizontal lines of similar intensity)
      // This is a simplified detection - looks for rectangular regions
      
      const scanLineHeight = 40; // Typical input height
      const minWidth = Math.floor(width * 0.15); // Minimum 15% of screen width
      
      for (let y = 0; y < height - scanLineHeight; y += 20) {
        for (let x = 0; x < width - minWidth; x += 50) {
          const region = this.analyzeRegion(data, width, height, x, y, Math.min(400, width - x), scanLineHeight);
          
          if (region.isInputField) {
            regions.push({
              x,
              y,
              width: region.width,
              height: scanLineHeight,
              type: 'detected_input',
            });
            x += region.width; // Skip past this region
          }
        }
      }
    } catch (e) {
      console.error('Input field detection error:', e);
    }

    // Limit to top 10 most likely regions
    return regions.slice(0, 10);
  }

  /**
   * Analyze a region to determine if it looks like an input field
   */
  private static analyzeRegion(
    data: Buffer,
    imgWidth: number,
    imgHeight: number,
    x: number,
    y: number,
    regionWidth: number,
    regionHeight: number
  ): { isInputField: boolean; width: number } {
    let pixelCount = 0;
    let totalIntensity = 0;
    let edgeCount = 0;

    // Sample pixels in the region
    for (let ry = 0; ry < regionHeight; ry += 2) {
      for (let rx = 0; rx < regionWidth; rx += 2) {
        const px = x + rx;
        const py = y + ry;
        
        if (px < imgWidth && py < imgHeight) {
          const idx = py * imgWidth + px;
          if (idx < data.length) {
            totalIntensity += data[idx];
            pixelCount++;

            // Check for edges (intensity changes)
            if (rx > 0) {
              const prevIdx = py * imgWidth + (px - 2);
              if (prevIdx >= 0 && prevIdx < data.length) {
                if (Math.abs(data[idx] - data[prevIdx]) > 30) {
                  edgeCount++;
                }
              }
            }
          }
        }
      }
    }

    if (pixelCount === 0) {
      return { isInputField: false, width: regionWidth };
    }

    const avgIntensity = totalIntensity / pixelCount;
    const edgeRatio = edgeCount / pixelCount;

    // Input fields typically:
    // 1. Have moderate to high intensity (white/light background)
    // 2. Have clear edges (borders)
    // 3. Are relatively uniform inside
    
    const isInputField = avgIntensity > 200 && // Light background
                         avgIntensity < 255 && // Not pure white (has some content)
                         edgeRatio > 0.02 &&   // Has some edges
                         edgeRatio < 0.15;     // But not too many (not text-heavy)

    return { isInputField, width: regionWidth };
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

    // Create composite operations for each blurred region
    const composites: sharp.OverlayOptions[] = [];

    for (const region of regions) {
      // Ensure region is within bounds
      const safeX = Math.max(0, Math.min(region.x, width - 1));
      const safeY = Math.max(0, Math.min(region.y, height - 1));
      const safeWidth = Math.min(region.width, width - safeX);
      const safeHeight = Math.min(region.height, height - safeY);

      if (safeWidth <= 0 || safeHeight <= 0) continue;

      try {
        // Extract the region
        const regionBuffer = await sharp(imageBuffer)
          .extract({
            left: safeX,
            top: safeY,
            width: safeWidth,
            height: safeHeight,
          })
          .blur(25) // Strong blur
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

    // Apply all blurred regions as composites
    if (composites.length > 0) {
      return sharp(imageBuffer).composite(composites);
    }

    return sharp(imageBuffer);
  }

  /**
   * Process text extracted from OCR and detect sensitive patterns
   */
  static detectSensitiveText(text: string): { hasSensitive: boolean; types: string[] } {
    const types: string[] = [];

    for (const [type, pattern] of Object.entries(this.SENSITIVE_PATTERNS)) {
      // Reset regex state
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        types.push(type);
      }
    }

    return {
      hasSensitive: types.length > 0,
      types,
    };
  }

  /**
   * Quick check if an image likely contains sensitive UI elements
   * Based on filename, path, or quick analysis
   */
  static async quickSensitivityCheck(
    imagePath: string,
    windowTitle?: string,
    appName?: string
  ): Promise<boolean> {
    // First, check context
    if (this.isSensitiveContext(windowTitle, appName)) {
      return true;
    }

    // Check filename/path for sensitive indicators
    const lowerPath = imagePath.toLowerCase();
    const sensitivePathPatterns = ['password', 'login', 'bank', 'card', 'payment', 'auth'];
    
    for (const pattern of sensitivePathPatterns) {
      if (lowerPath.includes(pattern)) {
        return true;
      }
    }

    return false;
  }
}
