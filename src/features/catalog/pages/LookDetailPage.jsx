import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ProductsAPI } from "features/catalog/api/products.api";
import { pickData } from "shared/api/pickers";
import { getApiErrorMessage } from "shared/api/request";

function TriangleArrow({
  className = "w-full h-full text-red-500",
  direction = "right",
}) {
  const rotateClass = direction === "left" ? "rotate-180" : "";
  return (
    <svg
      className={`${className} ${rotateClass}`}
      viewBox="8 0 12 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="8,4 8,20 20,12" fill="currentColor" />
    </svg>
  );
}

export default function LookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [look, setLook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [lookMd, setLookMd] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const swipeRef = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    active: false,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadErr("");

        const res = await ProductsAPI.get(id);
        const detail = pickData(res);

        if (!detail) throw new Error("룩 데이터를 불러오지 못했습니다.");
        if (detail.categorySlug !== "look") {
          throw new Error("look 항목이 아닙니다.");
        }

        if (alive) {
          setLook(detail);
          setCurrentIndex(0);
        }
      } catch (e) {
        if (alive) {
          setLook(null);
          setLoadErr(getApiErrorMessage(e, "룩 상세 로드 실패"));
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    let alive = true;

    async function loadMd() {
      const lookMdUrl = look?.lookMdUrl ?? "";
      if (!lookMdUrl) {
        if (alive) setLookMd("");
        return;
      }

      try {
        const res = await fetch(lookMdUrl);
        if (!res.ok) throw new Error("md fetch fail");
        const txt = await res.text();
        if (alive) setLookMd(txt);
      } catch {
        if (alive) setLookMd("");
      }
    }

    loadMd();
    return () => {
      alive = false;
    };
  }, [look]);

  const images = look?.images ?? [];

  const goPrevImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNextImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  const onTouchStart = (e) => {
    if (images.length <= 1) return;
    const t = e.touches?.[0];
    if (!t) return;
    swipeRef.current.startX = t.clientX;
    swipeRef.current.startY = t.clientY;
    swipeRef.current.dx = 0;
    swipeRef.current.dy = 0;
    swipeRef.current.active = true;
  };

  const onTouchMove = (e) => {
    if (!swipeRef.current.active) return;
    const t = e.touches?.[0];
    if (!t) return;
    swipeRef.current.dx = t.clientX - swipeRef.current.startX;
    swipeRef.current.dy = t.clientY - swipeRef.current.startY;
  };

  const onTouchEnd = () => {
    if (!swipeRef.current.active) return;
    swipeRef.current.active = false;

    const { dx, dy } = swipeRef.current;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absY > absX) return;

    const THRESHOLD = 45;

    if (dx > THRESHOLD) {
      goPrevImage();
    } else if (dx < -THRESHOLD) {
      goNextImage();
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600">로딩중…</p>
      </main>
    );
  }

  if (!look) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600">{loadErr || "룩을 찾을 수 없습니다."}</p>
        <button className="text-red-500 underline" onClick={() => navigate(-1)}>
          GET OUT
        </button>
      </main>
    );
  }

  return (
    <>
      <header>
        <nav
          aria-label="카테고리"
          className="flex justify-center w-full md:w-[70%] mx-auto p-5 bg-white"
        >
          <NavLink
            to="/look"
            className={({ isActive }) =>
              `relative text-4xl xl:text-5xl font-bold -translate-x-1 uppercase px-2 py-1 transition-colors duration-200 ${
                isActive ? "text-white" : "text-red-500"
              }`
            }
            style={({ isActive }) =>
              isActive ? { WebkitTextStroke: "1px red" } : {}
            }
          >
            look
          </NavLink>
        </nav>
      </header>

      <main className="max-w-screen-2xl mx-auto p-6 grid gap-12 lg:grid-cols-2">
        <div className="lg:sticky lg:top-6 justify-self-center w-full">
          <div className="w-full max-w-[520px] mx-auto">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={goPrevImage}
                  className="hidden sm:grid w-12 h-24 place-items-center translate-x-2 hover:shadow-lg hover:bg-red-50 active:scale-95"
                  aria-label="이전 이미지"
                >
                  <TriangleArrow className="w-12 h-24 text-red-500" direction="left" />
                </button>
              ) : (
                <div className="hidden sm:block w-12 h-12" aria-hidden="true" />
              )}

              <div
                className="relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden rounded-2xl bg-gray-50">
                  <img
                    src={images[currentIndex]?.url ?? images[currentIndex]}
                    alt={`${look?.name || "look"} ${currentIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {images.length > 1 && (
                  <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`${idx + 1}번 이미지로 이동`}
                        className={[
                          "w-2.5 h-2.5 rounded-full transition-transform",
                          idx === currentIndex ? "bg-red-500 scale-110" : "bg-red-200",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={goNextImage}
                  className="hidden sm:grid w-12 h-24 place-items-center -translate-x-2 hover:shadow-lg hover:bg-red-50 active:scale-95"
                  aria-label="다음 이미지"
                >
                  <TriangleArrow className="w-12 h-24 text-red-500" direction="right" />
                </button>
              ) : (
                <div className="hidden sm:block w-12 h-12" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-8">
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold">
              {look?.name || "NO THINKING AREA"}
            </h1>
          </div>

          <section className="text-sm leading-7 text-black/90 max-w-none">
            {lookMd ? (
              <div className="whitespace-pre-line">{lookMd.trim()}</div>
            ) : (
              <p className="whitespace-pre-line">
                {look?.description ?? "룩 설명을 준비 중입니다."}
              </p>
            )}
          </section>
        </section>
      </main>
    </>
  );
}