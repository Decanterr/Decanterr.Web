// TypeScript interfaces mirroring Decanterr.Api DTOs

export interface BookDto {
  audibleProductId: string;
  title: string;
  subtitle?: string;
  titleWithSubtitle: string;
  description?: string;
  lengthInMinutes: number;
  contentType: string;
  authors: string[];
  narrators: string[];
  series: string[];
  categories: string[];
  locale?: string;
  isAbridged: boolean;
  communityRating?: RatingDto;
  userData?: UserDefinedItemDto;
  libraryInfo?: LibraryBookDto;
  pictureId?: string;
  datePublished?: string;
  publisher?: string;
}

export interface RatingDto {
  overallRating: number;
  performanceRating: number;
  storyRating: number;
}

export interface UserDefinedItemDto {
  bookStatus: string;
  pdfStatus?: string;
  tags?: string;
  userRating?: number;
  lastDownloaded?: string;
  isFinished: boolean;
}

export interface LibraryBookDto {
  dateAdded: string;
  account: string;
  isDeleted: boolean;
  isAudiblePlus: boolean;
  absentFromLastScan: boolean;
}

export interface SearchResultDto {
  books: BookDto[];
  totalCount: number;
  query?: string;
}

export interface LiberateRequestDto {
  input: string;
}

export interface LiberateResponseDto {
  status: string;
  asin: string;
  title?: string;
  message?: string;
}

export interface ScanResponseDto {
  status: string;
  totalCount: number;
  newCount: number;
  message?: string;
}

export interface AccountDto {
  accountId: string;
  accountName?: string;
  locale?: string;
  libraryScan: boolean;
  hasTokens: boolean;
}

export interface QueueItemDto {
  asin: string;
  title?: string;
  status: string;
  progressPercent: number;
  statusMessage?: string;
  queuedAt: string;
}

export interface StatsDto {
  totalBooks: number;
  liberated: number;
  notLiberated: number;
  inError: number;
  inQueue: number;
  podcasts: number;
}

export interface UpdateTagsDto {
  tags: string;
}

export interface UpdateRatingDto {
  rating: number;
}

export interface UpdateStatusDto {
  status: string;
}

export interface BulkLiberateDto {
  asins: string[];
}

// Audiobookshelf types
export interface AbsStatusResponse {
  enabled: boolean;
  connected: boolean;
}

export interface AbsLibrary {
  id: string;
  name: string;
  folders: AbsFolder[];
}

export interface AbsFolder {
  id: string;
  fullPath: string;
}

export interface AbsSettings {
  enabled: boolean;
  url: string;
  hasApiToken: boolean;
}

export interface UpdateAbsSettingsRequest {
  enabled: boolean;
  url: string;
  apiToken?: string;
}

// Login types
export interface LoginStartRequest {
  accountId: string;
  locale: string;
  accountName?: string;
}

export interface LoginStartResponse {
  sessionId: string;
  loginUrl: string;
}

export interface LoginCompleteRequest {
  sessionId: string;
  responseUrl: string;
}

export interface AudibleLocale {
  name: string;
  label: string;
}
