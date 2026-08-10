import { createSlice, createAsyncThunk, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';

export interface Post {
  id: string;
  platform: string;
  content: string;
  image?: string;
  date: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface EditorState {
  content: string;
  image?: string;
  platform: string;
  editing: boolean;
  editingId?: string;
}

export interface PostsState {
  posts: ReturnType<typeof postsAdapter.getInitialState>;
  editor: EditorState;
  validation: ValidationResult;
}

export const postsAdapter = createEntityAdapter<Post>();

const initialState: PostsState = {
  posts: postsAdapter.getInitialState(),
  editor: {
    content: '',
    image: undefined,
    platform: 'Twitter',
    editing: false,
    editingId: undefined,
  },
  validation: { valid: true, message: '' },
};

export const loadDrafts = createAsyncThunk('posts/loadDrafts', async () => {
  const drafts = await mockApi.loadDrafts();
  return drafts;
});

export const createDraft = createAsyncThunk('posts/createDraft', async (draft: Omit<Post, 'id'>) => {
  const newDraft: Post = { id: nanoid(), ...draft };
  await mockApi.saveDraft(newDraft);
  return newDraft;
});

export const updateDraft = createAsyncThunk('posts/updateDraft', async ({ id, changes }: { id: string; changes: Partial<Post> }) => {
  const updated = await mockApi.updateDraft(id, changes);
  if (!updated) throw new Error('Draft not found');
  return updated;
});

export const deleteDraft = createAsyncThunk('posts/deleteDraft', async (id: string) => {
  await mockApi.deleteDraft(id);
  return id;
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setEditorContent(state, action: PayloadAction<string>) {
      state.editor.content = action.payload;
    },
    setEditorImage(state, action: PayloadAction<string | undefined>) {
      state.editor.image = action.payload;
    },
    setEditorPlatform(state, action: PayloadAction<string>) {
      state.editor.platform = action.payload;
    },
    setEditing(state, action: PayloadAction<string>) {
      const id = action.payload;
      const draft = state.posts.entities[id];
      if (draft) {
        state.editor = {
          content: draft.content,
          image: draft.image,
          platform: draft.platform,
          editing: true,
          editingId: id,
        };
      }
    },
    clearEditor(state) {
      state.editor = {
        content: '',
        image: undefined,
        platform: 'Twitter',
        editing: false,
        editingId: undefined,
      };
    },
    setValidation(state, action: PayloadAction<ValidationResult>) {
      state.validation = action.payload;
    },
    addPost(state, action: PayloadAction<Post>) {
      postsAdapter.addOne(state.posts, action.payload);
    },
    updatePost(state, action: PayloadAction<{ id: string; changes: Partial<Post> }>) {
      postsAdapter.updateOne(state.posts, { id: action.payload.id, changes: action.payload.changes });
    },
    deletePost(state, action: PayloadAction<string>) {
      postsAdapter.removeOne(state.posts, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadDrafts.fulfilled, (state, action) => {
      postsAdapter.setAll(state.posts, action.payload);
    });
    builder.addCase(createDraft.fulfilled, (state, action) => {
      postsAdapter.addOne(state.posts, action.payload);
    });
    builder.addCase(updateDraft.fulfilled, (state, action) => {
      const { id, ...changes } = action.payload;
      postsAdapter.updateOne(state.posts, { id, changes });
    });
    builder.addCase(deleteDraft.fulfilled, (state, action) => {
      postsAdapter.removeOne(state.posts, action.payload);
    });
  },
});

export const {
  setEditorContent,
  setEditorImage,
  setEditorPlatform,
  setEditing,
  clearEditor,
  setValidation,
  addPost,
  updatePost,
  deletePost,
} = postsSlice.actions;

export default postsSlice.reducer;
