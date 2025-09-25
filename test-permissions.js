// Test script để kiểm tra phân quyền
// Chạy script này trong browser console để test

console.log('=== TEST PHÂN QUYỀN ===');

// Lấy thông tin user hiện tại từ localStorage
const userData = localStorage.getItem('user');
if (userData) {
  const user = JSON.parse(userData);
  console.log('User hiện tại:', user);
  
  if (user.role && user.role.permissions) {
    console.log('Quyền của user:', user.role.permissions);
    
    // Kiểm tra các quyền cụ thể
    const permissions = user.role.permissions;
    console.log('user:read:', permissions['user:read']);
    console.log('user:create:', permissions['user:create']);
    console.log('user:update:', permissions['user:update']);
    console.log('user:delete:', permissions['user:delete']);
    
    // Test logic kiểm tra quyền
    const hasUserReadPermission = () => {
      if (!user?.role?.permissions) return false;
      return user.role.permissions['user:read'] === true;
    };
    
    console.log('Có quyền xem người dùng:', hasUserReadPermission());
    
    if (!hasUserReadPermission()) {
      console.log('❌ User không có quyền xem người dùng - sẽ hiển thị thông báo lỗi');
    } else {
      console.log('✅ User có quyền xem người dùng - sẽ hiển thị danh sách');
    }
  } else {
    console.log('❌ User không có thông tin role hoặc permissions');
  }
} else {
  console.log('❌ Không tìm thấy thông tin user trong localStorage');
}

console.log('=== KẾT THÚC TEST ===');

