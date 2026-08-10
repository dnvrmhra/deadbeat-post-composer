import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { postsAdapter } from './postsSlice';

const selectPostsState = (state: RootState) => state.posts.posts;

const {
  selectAll,
  selectById,
  selectIds,
  selectEntities,
  selectTotal,
} = postsAdapter.getSelectors(selectPostsState);

export const selectAllPosts = selectAll;
export const selectPostById = selectById;
export const selectPostIds = selectIds;
export const selectPostEntities = selectEntities;
export const selectPostTotal = selectTotal;

export const selectPostsByPlatform = (platform: string) =>
  createSelector([selectAllPosts], (posts) =>
    posts.filter((post) => post.platform === platform)
  );
