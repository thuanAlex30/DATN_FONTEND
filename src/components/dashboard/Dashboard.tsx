import { useState } from 'react';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('Trang chủ');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              <span className="mr-2">✱</span>
              <span className="font-script">logo</span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex space-x-8">
            {['Trang chủ', 'Giới thiệu', 'Trung tâm trợ giúp', 'Liên hệ', 'Câu hỏi thường gặp'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-6">
            <div className="space-y-2">
              {[
                { name: 'Trang chủ', icon: '🏠', active: true },
                { name: 'Hồ sơ', icon: '👤', active: false },
                { name: 'Vé hỗ trợ', icon: '🎫', active: false },
                { name: 'Thông báo', icon: '🔔', active: false },
                { name: 'Trung tâm trợ giúp', icon: '❓', active: false },
                { name: 'Câu hỏi thường gặp', icon: '❓', active: false },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="mt-8 space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <span className="text-lg">⚙️</span>
                <span className="font-medium">Cài đặt</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <span className="text-lg">→</span>
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Tăng Cường An Toàn Công Trường Của Bạn
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-3xl">
              SiteSafe Pro cung cấp các giải pháp quản lý an toàn toàn diện để bảo vệ nhân viên và đảm bảo tuân thủ.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Bắt đầu ngay
            </button>
          </div>

          {/* Features Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Các tính năng chính của SiteSafe Pro
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Quản lý sự cố</h3>
                <p className="text-gray-600 mb-4">
                  Ghi lại, theo dõi và giải quyết các sự cố an toàn một cách hiệu quả.
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Tìm hiểu thêm →
                </button>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Kiểm tra & Đánh giá</h3>
                <p className="text-gray-600 mb-4">
                  Thực hiện kiểm tra an toàn thường xuyên và quản lý các đánh giá rủi ro.
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Tìm hiểu thêm →
                </button>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Đào tạo & Chứng nhận</h3>
                <p className="text-gray-600 mb-4">
                  Quản lý các khóa đào tạo an toàn và theo dõi chứng nhận của nhân viên.
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Tìm hiểu thêm →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600">Tài nguyên</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Pháp lý</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Công ty</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 