/** "Delivered *on the agreed date*." → text with the starred part in the signal colour. Text only, never HTML. */
export function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} className="font-bold text-signal">
            {part}
          </b>
        ) : (
          part
        ),
      )}
    </>
  );
}
