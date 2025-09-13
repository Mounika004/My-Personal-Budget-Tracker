export default function handleApiError(err, setError) {
  const msg =
    err?.response?.data?.message || err?.message || "Something went wrong";
  console.error("API error →", err?.response || err);
  if (typeof setError === "function") setError(msg);
  else alert(msg);
}
