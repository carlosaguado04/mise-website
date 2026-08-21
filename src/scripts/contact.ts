const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
const copyBtn = document.querySelector<HTMLButtonElement>("[data-copy-email]");
const inbox = form?.dataset.email ?? "";

copyBtn?.addEventListener("click", async () => {
  if (!inbox) return;
  try {
    await navigator.clipboard.writeText(inbox);
    copyBtn.textContent = "Copied";
    window.setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1600);
  } catch {
    copyBtn.textContent = "Copy failed";
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const err = document.querySelector<HTMLElement>("[data-contact-err]");
  const ok = document.querySelector<HTMLElement>("[data-contact-ok]");
  const submit = document.querySelector<HTMLButtonElement>("[data-contact-submit]");
  if (err) err.hidden = true;

  const data = new FormData(form);
  if (String(data.get("company") ?? "").trim()) return;

  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();
  if (!name || !email || !message || !inbox) {
    if (err) err.hidden = false;
    return;
  }

  if (submit) submit.disabled = true;

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: "Mise contact",
        _replyto: email,
      }),
    });
    if (!res.ok) throw new Error("send failed");
    form.hidden = true;
    if (ok) ok.hidden = false;
  } catch {
    if (err) err.hidden = false;
    if (submit) submit.disabled = false;
  }
});
