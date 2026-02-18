import { useState } from "react";

function SecretPage() {
  const [showBox, setShowBox] = useState(true);

  return (
    <>
      <div className="w-full min-h-[calc(100dvh-320px)] flex items-center justify-center px-4">
        <img
          src="/mood/brand-write.png"
          alt="비밀"
          className="w-full max-w-3xl object-contain"
        />
      </div>

      {showBox ? (
        <div
          className="
            fixed z-50
            right-4 left-4 sm:left-auto sm:right-6
            bottom-6 sm:bottom-6
            bg-white text-black
            rounded-2xl border-2 border-red-500 shadow-2xl
            w-auto sm:w-[720px]
            max-w-[calc(100vw-2rem)]
            h-auto sm:h-[400px]
            min-h-[200px] sm:min-h-0
            max-h-[calc(100dvh-6rem)]
            p-4 sm:p-8
            flex flex-col
          "
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            className="text-sm text-right text-gray-500 hover:text-red-500 self-end"
            onClick={() => setShowBox(false)}
          >
            GET OUT
          </button>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-8 px-2">
            <p className="text-4xl sm:text-7xl font-bold text-center leading-tight">
              이걸 찾네 ㅋㅋ
            </p>
            <p className="text-xl sm:text-4xl font-bold text-center leading-tight">
              해킹당하신 거 아니에요!
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default SecretPage;
