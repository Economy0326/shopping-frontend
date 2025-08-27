import { useState } from "react";

function SecretPage() {
  const [showBox, setShowBox] = useState(true);

  return (
    <>
      <div className="w-full h-[calc(100vh-400px)] flex items-center justify-center">
        <img
          src="/mood/brand-write.png"
          alt="비밀"
          className="w-full max-w-3xl object-contain"
        />
      </div>

      {showBox ? (
        <div className="fixed bottom-6 right-6 bg-white text-black rounded-xl border-2 border-red-500 shadow-2xl w-[520px] sm:w-[720px] h-[300px] sm:h-[400px] p-6 sm:p-8 z-50 flex flex-col justify-between">
          <p
            className="text-sm text-right text-gray-500 hover:text-red-500 cursor-pointer"
            onClick={() => setShowBox(false)}
          >
            GET OUT
          </p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-6xl sm:text-8xl font-bold text-center mb-10">이걸 찾네 ㅋㅋ</p>
            <p className="text-4xl sm:text-5xl font-bold text-center">해킹당하신 거 아니에요!</p>
          </div>
        </div>
      ) : (
        <p className="fixed bottom-6 right-6 text-sm text-gray-400"></p>
      )}
    </>
  );
}

export default SecretPage;