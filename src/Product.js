// rating값과 reviewCount 값은 실제 DB 또는 API에서 가져와야 함
const products = {
  tops: [
    { id: 'top1', name: "A", price: "₩29,000", image: "/wear/top1.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top2', name: "B", price: "₩29,000", image: "/wear/top2.jpg" ,rating: 4.5, reviewCount:12, soldOut: true },
    { id: 'top3', name: "C", price: "₩29,000", image: "/wear/top3.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top4', name: "D", price: "₩29,000", image: "/wear/top4.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top5', name: "E", price: "₩29,000", image: "/wear/top5.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top6', name: "F", price: "₩29,000", image: "/wear/top6.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top7', name: "G", price: "₩29,000", image: "/wear/top7.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top8', name: "H", price: "₩29,000", image: "/wear/top8.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top9', name: "I", price: "₩29,000", image: "/wear/top9.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top10', name: "J", price: "₩29,000", image: "/wear/top10.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'top11', name: "K", price: "₩39,000", image: "/wear/top11.jpg" ,rating: 4.5, reviewCount:12, soldOut: false }
  ],
  bottoms: [
    { id: 'bottom1', name: "A", price: "₩49,000", image: "/wear/bottom1.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
  ],
  hats: [
    { id: 'hat1', name: "A", price: "₩19,000", image: "/wear/hat1.jpg" ,rating: 4.5, reviewCount:12, soldOut: false },
    { id: 'hat2', name: "B", price: "₩25,000", image: "/wear/hat2.jpg" ,rating: 4.5, reviewCount:12, soldOut: false }
  ],
  accessories: [

  ]
};
export default products;