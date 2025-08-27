const products = [
  {
    id: "1",
    name: "Basic Jacket",
    price: 79000,
    category: "outer",
    images: ["/wear/top1.jpg", "/wear/look1.jpg"],
    colors: ["white"],
    sizes: [1, 2], 

    // 옵션 표시 순서
    optionOrder: ["Size", "Color"],

    // SKU 조합 (size x color)
    variants: [
      {
        sku: "1-1-WHITE",                     // 규칙 예: {id}-{size}-{color}
        options: { Size: "1", Color: "white" },
        priceDelta: 0,                        // 최종가 = price + priceDelta
        stock: 20,                            // 예시 재고
        images: ["/wear/top1.jpg"],              // 색상별 이미지가 있으면 바꿔 넣기
      },
      {
        sku: "1-2-WHITE",
        options: { Size: "2", Color: "white" },
        priceDelta: 0,
        stock: 15,
        images: ["/wear/top1.jpg"],
      },
    ],
  },

  {
    id: "2",
    name: "Who the fuck is liam? T-Shirt 말은 이렇게 하지만 리암 정말 사랑해요 티셔츠",
    price: 49000,
    category: "top",
    images: ["/wear/top1.jpg"],
    colors: ["white", "black"],
    sizes: [1],

    optionOrder: ["Size", "Color"],

    variants: [
      {
        sku: "2-1-WHITE",
        options: { Size: "1", Color: "white" },
        priceDelta: 0,
        stock: 30,
        images: ["/wear/top1.jpg"],
      },
      {
        sku: "2-1-BLACK",
        options: { Size: "1", Color: "black" },
        priceDelta: 0,
        stock: 0,                 // 품절 예시(프런트에서 자동 비활성화)
        images: ["/wear/top1.jpg"],
      },
    ],
  },

  // 룩북(look) 카테고리는 구매/가격 비노출 로직 그대로 사용
  {
    id: "3",
    name: "Look #1",
    category: "look",
    images: ["/wear/look1.jpg"],
    // sizes/colors/variants 없어도 OK
    sizes: [],
    colors: [],
    variants: [],
  },
];

export default products;
