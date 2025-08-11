import { toast } from "react-toastify";

export default function LoginModal({
  username,
  password,
  setUsername,
  setPassword,
  setIsLoggedIn,
  setShowLoginModal,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-red-500 text-white p-6 rounded w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold">LOGIN</h2>
          <h2
            className="text-sm font-bold cursor-pointer hover:text-gray-200"
            onClick={() => setShowLoginModal(false)}
          >
            GET OUT
          </h2>
        </div>
        <input
          type="text"
          placeholder="ID"
          className="w-full border-b-4 border-white bg-transparent text-2xl text-white placeholder-white py-2 mb-2 font-bold focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="PW"
          className="w-full border-b-4 border-white bg-transparent text-2xl text-white placeholder-white py-2 mb-2 font-bold focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={() => {
            if (username.trim() && password.trim()) {
              setIsLoggedIn(true);
              setShowLoginModal(false);
              toast.success("환영합니다");
            } else {
              toast.error("ID와 PW를 입력해주세요");
            }
          }}
          className="w-full bg-white text-red-500 text-2xl font-bold rounded py-2 mb-1"
        >
          LOGIN
        </button>
        <button className="w-full bg-white text-red-500 text-2xl font-bold rounded py-2 mb-1">
          CREATE AN ACCOUNT
        </button>
      </div>
    </div>
  );
}