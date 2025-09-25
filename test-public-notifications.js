// Test script để kiểm tra API thông báo công khai
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testPublicNotifications() {
    try {
        console.log('🔍 Đang kiểm tra API thông báo công khai...');
        
        const response = await axios.get(`${API_BASE_URL}/notifications/public`, {
            timeout: 10000
        });
        
        console.log('✅ API thông báo công khai hoạt động tốt!');
        console.log('📊 Dữ liệu trả về:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.data && response.data.data.notifications) {
            console.log(`📝 Tổng số thông báo công khai: ${response.data.data.notifications.length}`);
            
            response.data.data.notifications.forEach((notification, index) => {
                console.log(`\n📢 Thông báo ${index + 1}:`);
                console.log(`   - ID: ${notification._id}`);
                console.log(`   - Tiêu đề: ${notification.title}`);
                console.log(`   - Loại: ${notification.type}`);
                console.log(`   - Mức độ ưu tiên: ${notification.priority}`);
                console.log(`   - Danh mục: ${notification.category}`);
                console.log(`   - Thời gian: ${notification.relative_time || notification.formatted_created_at}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra API thông báo công khai:');
        if (error.response) {
            console.error(`   - Status: ${error.response.status}`);
            console.error(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else if (error.request) {
            console.error('   - Không có phản hồi từ server');
        } else {
            console.error(`   - Lỗi: ${error.message}`);
        }
    }
}

// Chạy test
testPublicNotifications();

