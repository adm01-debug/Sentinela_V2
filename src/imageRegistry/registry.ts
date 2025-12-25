/**
 * @fileoverview Image registry
 * @module @sentinela/core/imageRegistry
 * @version 13.0.0
 */

import { Image, Repository, Layer } from './types';

export class ImageRegistry {
  private repositories: Map<string, Repository> = new Map();
  
  createRepository(name: string, visibility: 'public' | 'private' = 'private'): Repository {
    const repo: Repository = { name, images: [], visibility };
    this.repositories.set(name, repo);
    return repo;
  }
  
  push(repoName: string, image: Image): void {
    const repo = this.repositories.get(repoName);
    if (!repo) throw new Error('Repository not found');
    
    const existing = repo.images.findIndex(i => i.tag === image.tag);
    if (existing >= 0) repo.images[existing] = image;
    else repo.images.push(image);
  }
  
  pull(repoName: string, tag: string): Image | undefined {
    const repo = this.repositories.get(repoName);
    return repo?.images.find(i => i.tag === tag);
  }
  
  listTags(repoName: string): string[] {
    const repo = this.repositories.get(repoName);
    return repo?.images.map(i => i.tag) ?? [];
  }
  
  delete(repoName: string, tag: string): boolean {
    const repo = this.repositories.get(repoName);
    if (!repo) return false;
    const index = repo.images.findIndex(i => i.tag === tag);
    if (index >= 0) { repo.images.splice(index, 1); return true; }
    return false;
  }
}