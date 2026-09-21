import { createSlice, createAsyncThunk, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';
import { backendApi } from '../../api/backendApi';

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
  loaded: boolean;
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
  loaded: false,
};

/**
 * Load all drafts — runs only once per session (condition skips if loaded).
 */
export const loadDrafts = createAsyncThunk(
  'posts/loadDrafts',
  async () => {
    const backendReachable = await backendApi.isReachable();
    if (backendReachable) {
      try {
        const backendPosts = await backendApi.loadAll();
        const localPosts   = await mockApi.loadDrafts();
        // Exclude local drafts already in backend to avoid duplication
        const backendKeys  = new Set(backendPosts.map((p) => `${p.platform}|${p.content}`));
        const localOnly    = localPosts.filter(
          (p) => !p.id.startsWith('api-') && !backendKeys.has(`${p.platform}|${p.content}`)
        );
        return [...backendPosts, ...localOnly];
      } catch {
        return mockApi.loadDrafts();
      }
    }
    return mockApi.loadDrafts();
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as { posts: PostsState };
      return !state.posts.loaded;
    },
  }
);

/**
 * Create a new draft.
 * Accepts _useBackend flag so Composer can check reachability once
 * before the multi-platform loop instead of once per platform.
 */
export const createDraft = createAsyncThunk(
  'posts/createDraft',
  async (payload: Omit<Post, 'id'> & { _useBackend?: boolean }) => {
    const { _useBackend, ...draft } = payload;
    if (_useBackend) {
      try {
        const created = await backendApi.create(draft);
        return created;
      } catch {
        // Backend rejected — fall through to localStorage
      }
    }
    const newDraft: Post = { id: nanoid(), ...draft };
    await mockApi.saveDraft(newDraft);
    return newDraft;
  }
);

/**
 * Update an existing draft.
 * Routes to backend for api- prefixed IDs, localStorage for the rest.
 */
export const updateDraft = createAsyncThunk('posts/updateDraft', async ({ id, changes }: { id: string; changes: Partial<Post> }) => {
  if (id.startsWith('api-')) {
    try {
      const updated = await backendApi.update(id, changes);
      return updated;
    } catch {
      // Fall through to localStorage
    }
  }
  const updated = await mockApi.updateDraft(id, changes);
  if (!updated) throw new Error('Draft not found');
  return updated;
});

/**
 * Delete a draft.
 * Routes to backend for api- prefixed IDs, localStorage for the rest.
 */
export const deleteDraft = createAsyncThunk('posts/deleteDraft', async (id: string) => {
  if (id.startsWith('api-')) {
    try {
      await backendApi.remove(id);
    } catch {
      // Backend delete failed — still remove from local state
    }
  }
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
      state.loaded = true;
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
