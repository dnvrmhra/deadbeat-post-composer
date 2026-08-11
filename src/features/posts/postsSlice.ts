import { createSlice, createAsyncThunk, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';

export interface Post {
  id: string;
  platform: string;
  content: string;
  images?: string[];
  image?: string;
  date: string;
  scheduledAt?: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface PlatformVariant {
  content: string;
  images: string[];
  customized?: boolean;
}

export interface EditorState {
  content: string;
  images: string[];
  platform: string;
  selectedPlatforms: string[];
  activeTab: string;
  variants: Record<string, PlatformVariant>;
  editing: boolean;
  editingId?: string;
  scheduledAt: string;
}

export interface PostsState {
  posts: ReturnType<typeof postsAdapter.getInitialState>;
  editor: EditorState;
  validation: ValidationResult;
}

export const postsAdapter = createEntityAdapter<Post>();

const defaultVariants = (): Record<string, PlatformVariant> => ({
  Twitter: { content: '', images: [], customized: false },
  Instagram: { content: '', images: [], customized: false },
  LinkedIn: { content: '', images: [], customized: false },
  Facebook: { content: '', images: [], customized: false },
});

const initialState: PostsState = {
  posts: postsAdapter.getInitialState(),
  editor: {
    content: '',
    images: [],
    platform: 'Twitter',
    selectedPlatforms: ['Twitter'],
    activeTab: 'master',
    variants: defaultVariants(),
    editing: false,
    editingId: undefined,
    scheduledAt: '',
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
      const text = action.payload;
      state.editor.content = text;

      if (state.editor.activeTab === 'master') {
        Object.keys(state.editor.variants).forEach((p) => {
          if (!state.editor.variants[p].customized) {
            state.editor.variants[p].content = text;
          }
        });
      } else {
        const p = state.editor.activeTab;
        if (state.editor.variants[p]) {
          state.editor.variants[p].content = text;
          state.editor.variants[p].customized = true;
        }
      }
    },

    setEditorImages(state, action: PayloadAction<string[]>) {
      const imgs = action.payload;
      state.editor.images = imgs;

      if (state.editor.activeTab === 'master') {
        Object.keys(state.editor.variants).forEach((p) => {
          if (!state.editor.variants[p].customized) {
            state.editor.variants[p].images = imgs;
          }
        });
      } else {
        const p = state.editor.activeTab;
        if (state.editor.variants[p]) {
          state.editor.variants[p].images = imgs;
          state.editor.variants[p].customized = true;
        }
      }
    },

    addEditorImage(state, action: PayloadAction<string>) {
      const img = action.payload;
      const currentImgs = state.editor.images;
      const updated = [...currentImgs, img];
      state.editor.images = updated;

      if (state.editor.activeTab === 'master') {
        Object.keys(state.editor.variants).forEach((p) => {
          if (!state.editor.variants[p].customized) {
            state.editor.variants[p].images = updated;
          }
        });
      } else {
        const p = state.editor.activeTab;
        if (state.editor.variants[p]) {
          state.editor.variants[p].images = [...state.editor.variants[p].images, img];
          state.editor.variants[p].customized = true;
        }
      }
    },

    removeEditorImage(state, action: PayloadAction<number>) {
      const idx = action.payload;
      const updated = state.editor.images.filter((_, i) => i !== idx);
      state.editor.images = updated;

      if (state.editor.activeTab === 'master') {
        Object.keys(state.editor.variants).forEach((p) => {
          if (!state.editor.variants[p].customized) {
            state.editor.variants[p].images = updated;
          }
        });
      } else {
        const p = state.editor.activeTab;
        if (state.editor.variants[p]) {
          state.editor.variants[p].images = state.editor.variants[p].images.filter((_, i) => i !== idx);
          state.editor.variants[p].customized = true;
        }
      }
    },

    reorderEditorImages(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const imgs = [...state.editor.images];
      const [moved] = imgs.splice(from, 1);
      imgs.splice(to, 0, moved);
      state.editor.images = imgs;

      Object.keys(state.editor.variants).forEach((p) => {
        if (!state.editor.variants[p].customized) {
          state.editor.variants[p].images = imgs;
        }
      });
    },

    setEditorScheduledAt(state, action: PayloadAction<string>) {
      state.editor.scheduledAt = action.payload;
    },

    setEditorPlatform(state, action: PayloadAction<string>) {
      const platformName = action.payload;
      state.editor.platform = platformName;
      if (!state.editor.selectedPlatforms.includes(platformName)) {
        state.editor.selectedPlatforms = [...state.editor.selectedPlatforms, platformName];
      }
    },

    toggleSelectedPlatform(state, action: PayloadAction<string>) {
      const p = action.payload;
      const exists = state.editor.selectedPlatforms.includes(p);

      if (exists) {
        if (state.editor.selectedPlatforms.length > 1) {
          state.editor.selectedPlatforms = state.editor.selectedPlatforms.filter((item) => item !== p);
          if (state.editor.platform === p) {
            state.editor.platform = state.editor.selectedPlatforms[0];
          }
          if (state.editor.activeTab === p) {
            state.editor.activeTab = 'master';
          }
        }
      } else {
        state.editor.selectedPlatforms.push(p);
        if (!state.editor.variants[p].content && state.editor.content) {
          state.editor.variants[p].content = state.editor.content;
          state.editor.variants[p].images = state.editor.images;
        }
      }
    },

    setActiveTab(state, action: PayloadAction<string>) {
      state.editor.activeTab = action.payload;
    },

    resetVariantCustomization(state, action: PayloadAction<string>) {
      const p = action.payload;
      if (state.editor.variants[p]) {
        state.editor.variants[p] = {
          content: state.editor.content,
          images: state.editor.images,
          customized: false,
        };
      }
    },

    setEditing(state, action: PayloadAction<string | Post>) {
      const payload = action.payload;
      const id = typeof payload === 'string' ? payload : payload.id;
      const draft = typeof payload === 'string' ? state.posts.entities[id] : payload;

      if (draft) {
        const imgs = draft.images && draft.images.length > 0
          ? draft.images
          : draft.image
          ? [draft.image]
          : [];

        const vars = defaultVariants();
        vars[draft.platform] = { content: draft.content, images: imgs, customized: true };

        state.editor = {
          content: draft.content,
          images: imgs,
          platform: draft.platform,
          selectedPlatforms: [draft.platform],
          activeTab: 'master',
          variants: vars,
          editing: true,
          editingId: id,
          scheduledAt: draft.scheduledAt || '',
        };
      }
    },

    clearEditor(state) {
      state.editor = {
        content: '',
        images: [],
        platform: 'Twitter',
        selectedPlatforms: ['Twitter'],
        activeTab: 'master',
        variants: defaultVariants(),
        editing: false,
        editingId: undefined,
        scheduledAt: '',
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
      const updated = action.payload;
      postsAdapter.upsertOne(state.posts, updated);
    });
    builder.addCase(deleteDraft.fulfilled, (state, action) => {
      postsAdapter.removeOne(state.posts, action.payload);
    });
  },
});

export const {
  setEditorContent,
  setEditorImages,
  addEditorImage,
  removeEditorImage,
  reorderEditorImages,
  setEditorScheduledAt,
  setEditorPlatform,
  toggleSelectedPlatform,
  setActiveTab,
  resetVariantCustomization,
  setEditing,
  clearEditor,
  setValidation,
  addPost,
  updatePost,
  deletePost,
} = postsSlice.actions;

export default postsSlice.reducer;
