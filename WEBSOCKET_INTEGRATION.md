# WebSocket Integration - Hướng dẫn sử dụng

## Tổng quan
Hệ thống đã được tích hợp WebSocket để cung cấp thông báo realtime cho các sự kiện quan trọng trong hệ thống quản lý an toàn.

## Các tính năng đã tích hợp

### 1. Thông báo Sự cố (Incident Notifications)
- **incident_reported**: Khi nhân viên báo cáo sự cố mới
- **incident_classified**: Khi sự cố được phân loại
- **incident_assigned**: Khi sự cố được phân công xử lý
- **incident_closed**: Khi sự cố được đóng

### 2. Thông báo PPE (Personal Protective Equipment)
- **ppe_issued**: Khi PPE được cấp phát cho nhân viên
- **ppe_returned**: Khi PPE được trả về
- **ppe_low_stock**: Khi PPE sắp hết hàng
- **ppe_expiring**: Khi PPE sắp hết hạn sử dụng

### 3. Thông báo Đào tạo (Training Notifications)
- **training_session_created**: Khi phiên đào tạo mới được tạo
- **training_enrolled**: Khi nhân viên đăng ký khóa đào tạo
- **training_completed**: Khi nhân viên hoàn thành khóa đào tạo

### 4. Thông báo Hệ thống (System Notifications)
- **notification_created**: Thông báo hệ thống chung

## Cấu trúc Code

### 1. WebSocket Client (`src/services/websocketClient.js`)
- Quản lý kết nối WebSocket
- Xử lý các sự kiện từ server
- Tự động reconnect khi mất kết nối

### 2. Redux Store (`src/store/slices/websocketSlice.ts`)
- Quản lý state của WebSocket
- Lưu trữ thông báo và trạng thái kết nối
- Actions để thao tác với thông báo

### 3. Hook useWebSocket (`src/hooks/useWebSocket.ts`)
- Hook để sử dụng WebSocket trong components
- Tự động kết nối và đăng ký event listeners
- Trả về trạng thái kết nối và thông báo

### 4. Component RealtimeNotifications (`src/components/RealtimeNotifications/`)
- Component hiển thị thông báo realtime
- Giao diện người dùng cho thông báo
- Âm thanh thông báo và hiệu ứng

## Cách sử dụng

### 1. Trong App.tsx
```tsx
import RealtimeNotifications from './components/RealtimeNotifications';

// Trong component
{authToken && (
  <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
    <RealtimeNotifications authToken={authToken} />
  </div>
)}
```

### 2. Sử dụng hook trong component khác
```tsx
import { useWebSocket } from '../hooks/useWebSocket';

const MyComponent = () => {
  const { isConnected, notifications, unreadCount } = useWebSocket();
  
  return (
    <div>
      <p>Trạng thái: {isConnected ? 'Đã kết nối' : 'Mất kết nối'}</p>
      <p>Số thông báo chưa đọc: {unreadCount}</p>
    </div>
  );
};
```

### 3. Dispatch actions để quản lý thông báo
```tsx
import { useDispatch } from 'react-redux';
import { 
  markNotificationAsRead, 
  clearAllNotifications 
} from '../store/slices/websocketSlice';

const dispatch = useDispatch();

// Đánh dấu thông báo đã đọc
dispatch(markNotificationAsRead(notificationId));

// Xóa tất cả thông báo
dispatch(clearAllNotifications());
```

## Cấu hình

### 1. WebSocket Server URL
Mặc định: `http://localhost:3000`
Có thể thay đổi trong `useWebSocket.ts`:
```tsx
websocketClient.connect('http://your-server:3000', authToken);
```

### 2. Rooms (Phòng)
Hệ thống tự động join các phòng:
- `user_{userId}`: Phòng cá nhân của user
- `role_{roleName}`: Phòng theo vai trò (admin, employee, etc.)

### 3. Âm thanh thông báo
File âm thanh: `/public/notification-sound.mp3`
Có thể thay đổi trong `RealtimeNotifications/index.tsx`:
```tsx
<source src="/your-notification-sound.mp3" type="audio/mpeg" />
```

## Xử lý lỗi

### 1. Mất kết nối
- Tự động reconnect với exponential backoff
- Hiển thị trạng thái kết nối trong UI
- Lưu thông báo offline và sync khi kết nối lại

### 2. Lỗi xác thực
- Tự động disconnect khi token hết hạn
- Redirect về trang login nếu cần

### 3. Lỗi âm thanh
- Bỏ qua lỗi phát âm thanh (không block UI)
- Log lỗi vào console để debug

## Tùy chỉnh

### 1. Thêm loại thông báo mới
1. Thêm event listener trong `useWebSocket.ts`
2. Thêm case xử lý trong `websocketSlice.ts`
3. Cập nhật UI trong `RealtimeNotifications/index.tsx`

### 2. Thay đổi giao diện
- Chỉnh sửa CSS trong `RealtimeNotifications.css`
- Thay đổi icon và màu sắc theo loại thông báo

### 3. Thêm âm thanh khác nhau
- Thêm logic phân biệt âm thanh theo loại thông báo
- Sử dụng Web Audio API cho âm thanh phức tạp hơn

## Debugging

### 1. Console Logs
Tất cả sự kiện WebSocket đều được log vào console với emoji để dễ nhận biết:
- 🔌 WebSocket connection events
- 🚨 Incident events
- 🛡️ PPE events
- 🎓 Training events
- 🔔 System notifications

### 2. Redux DevTools
Có thể theo dõi state changes trong Redux DevTools:
- `websocket/setConnectionStatus`
- `websocket/addNotification`
- `websocket/markNotificationAsRead`
- etc.

### 3. Network Tab
Kiểm tra WebSocket connection trong Network tab của DevTools.

## Lưu ý quan trọng

1. **Performance**: Thông báo được giới hạn tối đa 50 items để tránh memory leak
2. **Security**: Chỉ user đã đăng nhập mới có thể kết nối WebSocket
3. **Compatibility**: Hỗ trợ fallback về polling nếu WebSocket không khả dụng
4. **Mobile**: Responsive design cho mobile devices
5. **Accessibility**: Hỗ trợ screen readers và keyboard navigation




