// client/src/data/meApi.js
import instance from "../utils/AxiosConfig";
import { pushToast } from "../redux/reducers/uiReducer";
import { store } from "../redux/store";
import { computeFromExpenses } from "../utils/finance";
import { setFriendLabel, getFriendLabel } from "../utils/friends";

const d = (action) => store.dispatch(action);

/** Load current user, expenses, and categories into Redux */
export async function loadMe() {
  d({ type: "ME_LOADING" });
  try {
    const { data } = await instance.get("/user/me");
    d({
      type: "ME_SET",
      payload: {
        email: data.email,
        username: data.username,
        expenses: data.expensis || [], // API returns `expensis`
        friends: data.friends || [],
      },
    });

    // Load categories (optional endpoint)
    try {
      const cats = await instance.get("/user/categories");
      if (cats?.data?.categories) {
        d({ type: "ME_SET_CATEGORIES", payload: cats.data.categories });
      }
    } catch {
      /* categories are optional */
    }
  } catch (e) {
    d({ type: "ME_ERROR", error: e?.response?.data?.msg || "Load error" });
    d(pushToast("Could not load your data", "error"));
  }
}

/** Add a friend by email; optionally store a friendly display name locally */
export async function addFriend(friendEmail, friendName) {
  try {
    await instance.post("/user/friend/add", { friendEmail });
    if (friendName) setFriendLabel(friendEmail, friendName);
    d(pushToast("Friend added", "success"));
    await loadMe(); // ensure friend appears immediately
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Add friend failed", "error"));
    throw e;
  }
}

/** Add a regular expense */
export async function addExpense(payload) {
  try {
    const { data } = await instance.post("/user/expense/add", payload);
    d({ type: "ME_SET_EXPENSES", payload: data.expensis || [] });
    d(pushToast("Expense added", "success"));
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Add expense failed", "error"));
    throw e;
  }
}

/** Edit an expense by id */
export async function editExpense(id, patch) {
  try {
    const { data } = await instance.patch(`/user/expense/${id}`, patch);
    d({ type: "ME_SET_EXPENSES", payload: data.expensis || [] });
    d(pushToast("Expense updated", "success"));
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Update failed", "error"));
    throw e;
  }
}

/** Delete an expense by id */
export async function deleteExpense(id) {
  try {
    const { data } = await instance.delete(`/user/expense/${id}`);
    d({ type: "ME_SET_EXPENSES", payload: data.expensis || [] });
    d(pushToast("Expense deleted", "success"));
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Delete failed", "error"));
    throw e;
  }
}

/**
 * Record a settlement with a friend.
 *
 * @param {string} friendEmail - Friend's email (ID on the server)
 * @param {number} amount      - NET amount to settle (e.g., ₹200)
 * @param {'they_pay'|'i_pay'} [direction] - Optional override of who pays.
 *
 * How it works:
 * - We determine the current balance with that friend (positive: they owe you; negative: you owe them).
 * - The payer is the debtor (unless `direction` overrides).
 * - We post a "Transfers" expense split equally between you two with amount = 2 × net,
 *   which changes the pairwise balance by exactly the `amount` you specified.
 * - The description is saved as "Settlement with <Friend Name>" for nicer Recent Activity.
 */
export async function settleWithFriend(friendEmail, amount, direction) {
  const state = store.getState();
  const meEmail = state.me.me?.email;
  const expenses = state.me.expenses || [];
  const { perFriend } = computeFromExpenses(meEmail, expenses);

  const currentBal =
    perFriend.find((p) => p.friend === friendEmail)?.value || 0; // + => they owe me
  const net = Number(amount || Math.abs(currentBal) || 0);

  if (!net || !meEmail || !friendEmail) {
    d(pushToast("Nothing to settle", "warning"));
    return;
  }

  // Decide payer: by override or inferred from current balance
  let payer;
  if (direction === "they_pay") payer = friendEmail;
  else if (direction === "i_pay") payer = meEmail;
  else payer = currentBal > 0 ? friendEmail : meEmail; // debtor pays

  // Nice label in description
  const friendLabel =
    getFriendLabel(friendEmail) || String(friendEmail).split("@")[0];

  const payload = {
    description: `Settlement with ${friendLabel}`,
    amount: net * 2, // equal split nets to `net`
    paidBy: payer,
    splitWith: `${meEmail},${friendEmail}`,
    category: "Transfers",
    date: new Date().toISOString(),
  };

  try {
    const { data } = await instance.post("/user/expense/add", payload);
    d({ type: "ME_SET_EXPENSES", payload: data.expensis || [] });
    d(pushToast("Settlement recorded", "success"));
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Settlement failed", "error"));
    throw e;
  }
}

/** Category management */
export async function addCategory(name, color) {
  try {
    const { data } = await instance.post("/user/category", { name, color });
    d({ type: "ME_SET_CATEGORIES", payload: data.categories || [] });
    d(pushToast("Category added", "success"));
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Add category failed", "error"));
    throw e;
  }
}

export async function renameCategory(oldName, newName, color) {
  try {
    const { data } = await instance.patch(
      `/user/category/${encodeURIComponent(oldName)}`,
      { newName, color }
    );
    if (data.expensis) {
      d({ type: "ME_SET_EXPENSES", payload: data.expensis });
    }
    if (data.categories) {
      d({ type: "ME_SET_CATEGORIES", payload: data.categories });
    }
    d(pushToast("Category updated", "success"));
  } catch (e) {
    d(pushToast(e?.response?.data?.msg || "Update category failed", "error"));
    throw e;
  }
}
