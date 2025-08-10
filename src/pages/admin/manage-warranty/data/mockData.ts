// import { WarrantyRequest } from '../types';

// export const mockWarrantyRequests: WarrantyRequest[] = [
//   {
//     id: "wr-001",
//     sku: "WR2024001",
//     requestType: "REPAIR",
//     status: "PENDING",
//     totalFee: 150000,
//     createdAt: "2024-01-15T10:30:00Z",
//     customer: {
//       name: "Nguyễn Thị Mai",
//       phone: "0901234567",
//       email: "mai.nguyen@email.com"
//     },
//     items: [
//       {
//         id: "wri-001",
//         orderItemId: "oi-001",
//         description: "Váy bị rách ở phần eo, cần sửa chữa",
//         images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop"],
//         destinationType: "FACTORY",
//         fee: 100000,
//         status: "PENDING",
//         warrantyRound: 1,
//         productName: "Váy Bầu Hoa Nhí",
//         orderCode: "ORD-2024001"
//       },
//       {
//         id: "wri-002",
//         orderItemId: "oi-002",
//         description: "Khóa kéo bị hỏng, không kéo được",
//         images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop"],
//         destinationType: "BRANCH",
//         fee: 50000,
//         status: "PENDING",
//         warrantyRound: 1,
//         productName: "Đầm Bầu Trơn",
//         orderCode: "ORD-2024002"
//       }
//     ],
//     noteInternal: null,
//     rejectedReason: null
//   },
//   {
//     id: "wr-002",
//     sku: "WR2024002",
//     requestType: "EXCHANGE",
//     status: "IN_TRANSIT",
//     totalFee: 0,
//     createdAt: "2024-01-14T14:20:00Z",
//     customer: {
//       name: "Trần Thị Lan",
//       phone: "0907654321",
//       email: "lan.tran@email.com"
//     },
//     items: [
//       {
//         id: "wri-003",
//         orderItemId: "oi-003",
//         description: "Sản phẩm không đúng size, cần đổi size lớn hơn",
//         images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop"],
//         destinationType: "BRANCH",
//         fee: 0,
//         status: "APPROVED",
//         warrantyRound: 1,
//         productName: "Set Bầu 2 Món",
//         orderCode: "ORD-2024003"
//       }
//     ],
//     noteInternal: "Khách hàng đã mang sản phẩm đến chi nhánh Quận 1",
//     rejectedReason: null
//   },
//   {
//     id: "wr-003",
//     sku: "WR2024003",
//     requestType: "REFUND",
//     status: "PARTIALLY_REJECTED",
//     totalFee: 75000,
//     createdAt: "2024-01-13T09:15:00Z",
//     customer: {
//       name: "Lê Thị Hoa",
//       phone: "0903456789",
//       email: "hoa.le@email.com"
//     },
//     items: [
//       {
//         id: "wri-004",
//         orderItemId: "oi-004",
//         description: "Màu sắc bị phai sau khi giặt",
//         images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop"],
//         destinationType: "FACTORY",
//         fee: 75000,
//         status: "APPROVED",
//         warrantyRound: 1,
//         productName: "Váy Bầu Dài Tay",
//         orderCode: "ORD-2024004"
//       },
//       {
//         id: "wri-005",
//         orderItemId: "oi-005",
//         description: "Không hài lòng với chất liệu vải",
//         images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop"],
//         destinationType: "BRANCH",
//         fee: 0,
//         status: "REJECTED",
//         warrantyRound: 1,
//         productName: "Áo Bầu Basic",
//         orderCode: "ORD-2024005",
//         rejectedReason: "Không đủ căn cứ để bảo hành"
//       }
//     ],
//     noteInternal: "Item 1 được chấp nhận bảo hành, Item 2 từ chối",
//     rejectedReason: "Một số item không đủ điều kiện bảo hành"
//   }
// ];
