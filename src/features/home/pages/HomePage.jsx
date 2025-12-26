import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="cursor-pointer w-full h-[calc(100vh-400px)] flex items-center justify-center"
        onClick={() => navigate("/secret")}
      >
        <img
          src="/mood/brand-logo.png"
          alt="메인 이미지"
          className="w-full max-w-3xl object-contain"
        />
      </div>
      <div className="w-full h-[calc(100vh-350px)] flex items-center justify-center">
        <img
          src="/mood/funny-main.gif"
          alt="우리는 성공한다"
          className="w-full max-w-3xl object-contain"
        />
      </div>
    </>
  );
}

export default Homepage;
