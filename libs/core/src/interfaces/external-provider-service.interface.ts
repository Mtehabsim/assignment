/**
 * Interface Segregation: ExternalProviderService contract
 */
import { Provider } from '../enums/program.enums';
import { SearchResult, ProgramDetails } from './external-provider.interface';

export interface IExternalProviderService {
  search(provider: Provider, query: string, limit: number): Promise<SearchResult[]>;
  fetchDetails(provider: Provider, externalId: string): Promise<ProgramDetails>;
}
