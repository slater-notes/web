import { RawDraftContentState } from 'draft-js';

export interface FolderItem {
  readonly id: string;
  title: string;
  created: number;
  updated: number;
  isStarred?: boolean;
  isDeleted?: boolean;
}

export interface NoteItem {
  readonly id: string;
  readonly nonce: string;
  title: string;
  created: number;
  updated: number;
  parentId?: string;
  isStarred?: boolean;
  isDeleted?: boolean;
}

export interface NoteDataContent {
  version: number;
  time: number;
  content: RawDraftContentState;
}

export interface NoteData {
  readonly id: string;
  revisions: NoteDataContent[];
}

export interface FileCollection {
  readonly userId: string;
  folders: FolderItem[];
  notes: NoteItem[];
}
