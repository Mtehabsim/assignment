/**
 * Interface Segregation: CMS write operations
 * Controllers/clients only depend on methods they use
 */
import { Program } from "../entities/program.entity";
import { UpdateProgramDto } from "../dto/program.dto";
import { Provider } from "../enums/program.enums";
import { SearchResult } from "./external-provider.interface";

export interface ICmsOperations {
  /**
   * Search external providers for content to import
   */
  searchExternal(
    provider: Provider,
    query: string,
    limit: number,
  ): Promise<SearchResult[]>;

  /**
   * Import a program from external provider as DRAFT
   */
  importProgram(provider: Provider, externalId: string): Promise<Program>;

  /**
   * List all draft programs
   */
  listDrafts(
    page: number,
    limit: number,
  ): Promise<{ data: Program[]; total: number }>;

  /**
   * Get program for editing
   */
  getEditorView(id: string): Promise<Program>;

  /**
   * Update program metadata
   */
  updateProgram(id: string, updateDto: UpdateProgramDto): Promise<Program>;

  /**
   * Publish program to public
   */
  publishProgram(id: string): Promise<Program>;

  /**
   * Archive/soft-delete program
   */
  archiveProgram(id: string): Promise<void>;
}
