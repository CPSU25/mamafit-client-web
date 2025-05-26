import { Button } from "@/components/ui/button";
import { Baby, Heart, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Decorative elements */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -top-2 -right-6 w-6 h-6 bg-purple-200 rounded-full opacity-40 animate-pulse delay-300"></div>
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-blue-200 rounded-full opacity-50 animate-pulse delay-700"></div>
        </div>

        {/* Main content card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <div className="absolute top-8 right-8">
              <Baby className="w-6 h-6 text-purple-400" />
            </div>
            <div className="absolute bottom-8 left-8">
              <Heart className="w-4 h-4 text-blue-400" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Baby className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          {/* 404 Number */}
          <div className="relative mb-6">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-none">
              404
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-pink-100 -z-10 translate-x-2 translate-y-2">
              404
            </div>
          </div>

          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
                <Baby className="w-12 h-12 md:w-16 md:h-16 text-pink-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Oops! Trang không tìm thấy</h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg mx-auto">
              Trang bạn tìm không tồn tại hoặc đã bị xóa.
            </p>
            <p className="text-gray-500 text-base md:text-lg">
              Hãy quay về trang chủ để khám phá những bộ sưu tập thời trang bầu tuyệt đẹp của MamaFit!
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => (window.location.href = "/")}
            >
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-8 flex justify-center space-x-4 opacity-60">
          <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-300"></div>
        </div>

        {/* Brand name */}
        <div className="mt-6">
          <p className="text-gray-400 text-sm font-medium tracking-wider">MAMAFIT</p>
        </div>
      </div>
    </div>
  )
}
