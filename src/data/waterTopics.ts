export interface WaterTopic {
  id: string;
  title: string;
  subtitle: string;
  overview: string;
  details: Array<{ heading: string; body: string }>;
  highlight: string;
}

export const waterTopics: WaterTopic[] = [
  {
    id: 'ph-levels',
    title: 'Độ pH của nước',
    subtitle: 'pH 5.0 là gì và ảnh hưởng ra sao',
    overview:
      'Độ pH xác định độ axit hoặc kiềm của nước. Nước uống an toàn nên có pH trong khoảng 6.5–8.5.',
    highlight: 'Nước pH 5.0 là nước axit, không phù hợp cho uống trực tiếp.',
    details: [
      {
        heading: 'Nước pH 5.0',
        body:
          'Nước có pH 5.0 thuộc loại axit nhẹ. Nếu uống trực tiếp, nó có thể gây kích ứng niêm mạc và thay đổi vị giác. Trong quan trắc nước, giá trị này cho thấy cần xử lý trung hòa trước khi sử dụng.'
      },
      {
        heading: 'Tiêu chuẩn an toàn',
        body:
          'Đối với nước sinh hoạt và nước uống, pH nên nằm trong khoảng 6.5 đến 8.5. Nếu thấp hơn, nước có thể ăn mòn ống dẫn và làm tăng lượng kim loại hòa tan.'
      },
      {
        heading: 'Giải pháp',
        body:
          'Để tăng pH, có thể dùng vôi, soda hoặc vật liệu lọc kiềm. Quan trắc đều đặn giúp kiểm soát kịp thời khi nước lệch khỏi vùng an toàn.'
      }
    ]
  },
  {
    id: 'drinkable-minerals',
    title: 'Khoáng chất trong nước uống',
    subtitle: 'Nước có khoáng chất nào là tốt cho sức khỏe?',
    overview:
      'Một số khoáng chất tự nhiên giúp nước uống an toàn và có lợi, như canxi, magiê và natri.',
    highlight: 'Canxi và magiê tăng độ tốt cho uống nhưng cần cân bằng.',
    details: [
      {
        heading: 'Canxi (Ca²⁺)',
        body:
          'Canxi giúp hỗ trợ xương và răng. Nồng độ vừa phải trong nước uống từ 20–80 mg/L là hợp lý.'
      },
      {
        heading: 'Magiê (Mg²⁺)',
        body:
          'Magiê góp phần cho hoạt động thần kinh và cơ bắp. Lượng magiê trong nước uống chất lượng nằm trong khoảng 10–30 mg/L.'
      },
      {
        heading: 'Natri và Kali',
        body:
          'Natri và Kali đều cần thiết nhưng không nên quá cao. Nước uống quá nhiều natri có thể không phù hợp với người cao huyết áp.'
      }
    ]
  },
  {
    id: 'water-hardness',
    title: 'Độ cứng của nước',
    subtitle: 'Nước mềm và nước cứng có gì khác?',
    overview:
      'Độ cứng đo hàm lượng canxi và magiê hòa tan. Nước cứng không độc, nhưng có thể gây cặn và ảnh hưởng thiết bị.',
    highlight: 'Nước cứng chứa nhiều canxi-magie, cần quan trắc để bảo trì hệ thống.',
    details: [
      {
        heading: 'Nước mềm',
        body:
          'Nước mềm chứa ít khoáng canxi và magiê. Nó ít tạo cặn nhưng đôi khi có thể kém ngon hơn khi uống trực tiếp.'
      },
      {
        heading: 'Nước cứng',
        body:
          'Nước cứng có lợi khi chứa khoáng, nhưng dễ tạo cặn trên ấm, máy giặt và đường ống. Độ cứng trung bình là 60–120 mg/L.'
      },
      {
        heading: 'Vận hành thiết bị',
        body:
          'Trong hệ thống quan trắc nước, cần xử lý nước cứng bằng trao đổi ion hoặc lọc để hạn chế sự cố vận hành.'
      }
    ]
  },
  {
    id: 'turbidity',
    title: 'Độ đục của nước',
    subtitle: 'Tại sao nước trong mà không có nghĩa là sạch?',
    overview:
      'Độ đục đo chất rắn lơ lửng trong nước. Nước trong nhưng đục cao vẫn có khả năng tồn tại vi sinh vật hoặc cặn.',
    highlight: 'Độ đục cao cảnh báo nước chưa lọc kỹ hoặc bị nhiễm bẩn.',
    details: [
      {
        heading: 'Ý nghĩa quan trắc',
        body:
          'Độ đục cao cho thấy nước có nhiều hạt mịn, bùn đất hoặc vi sinh vật. Đây là chỉ số quan trọng khi đánh giá nguồn nước thô.'
      },
      {
        heading: 'Tiêu chuẩn',
        body:
          'Đối với nước uống, độ đục tốt nhất nên nhỏ hơn 1 NTU. Nước sinh hoạt và sản xuất cũng cần kiểm soát giá trị này thấp để tránh ảnh hưởng chất lượng.'
      },
      {
        heading: 'Xử lý',
        body:
          'Lọc thô, xử lý keo tụ và lắng giúp giảm độ đục. Quan trắc liên tục giúp phát hiện bất thường ngay khi nước có hiện tượng ô nhiễm.'
      }
    ]
  },
  {
    id: 'monitoring-tips',
    title: 'Lời khuyên quan trắc nước',
    subtitle: 'Cách đọc và hành động với dữ liệu nước',
    overview:
      'Kiểm tra thường xuyên các chỉ số cơ bản giúp ngăn ngừa sự cố và bảo đảm nguồn nước an toàn.',
    highlight: 'Quan trắc thường xuyên giúp xác định sớm nguy cơ ô nhiễm.',
    details: [
      {
        heading: 'Chỉ số cần quan tâm',
        body:
          'pH, độ cứng, độ đục, clo dư và nhiễm khuẩn là các chỉ số nền tảng. Kết hợp với kiểm tra thành phần khoáng giúp đánh giá toàn diện.'
      },
      {
        heading: 'Lịch kiểm tra',
        body:
          'Nên lấy mẫu định kỳ theo tuần hoặc tháng tùy nguồn. Khi có thay đổi màu sắc, mùi vị hoặc độ đục, cần kiểm tra ngay lập tức.'
      },
      {
        heading: 'Ghi chú quan trọng',
        body:
          'Lưu trữ dữ liệu quan trắc và ghi chú xử lý giúp theo dõi tiến trình cải thiện chất lượng nước trong thời gian dài.'
      }
    ]
  }
];
