import type { Draft } from "../types/Draft";

const KEY = "drafts";

export function getDrafts(): Draft[] {

  const drafts = localStorage.getItem(KEY);

  return drafts ? JSON.parse(drafts) : [];

}

export function saveDraft(draft: Draft): void {

  const drafts = getDrafts();

  drafts.push(draft);

  localStorage.setItem(
    KEY,
    JSON.stringify(drafts)
  );

}

export function updateDraft(
  index: number,
  draft: Draft
): void {

  const drafts = getDrafts();

  drafts[index] = draft;

  localStorage.setItem(
    KEY,
    JSON.stringify(drafts)
  );

}

export function deleteDraft(index: number): void {

  const drafts = getDrafts();

  drafts.splice(index, 1);

  localStorage.setItem(
    KEY,
    JSON.stringify(drafts)
  );

}