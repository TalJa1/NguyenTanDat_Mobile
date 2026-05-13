import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

type GuideDetailRouteProp = RouteProp<{
  GuideDetail: {
    guideId: string;
    title: string;
    category: 'cleaning' | 'classification' | 'emergency';
  };
}, 'GuideDetail'>;

interface GuideDetailProps {
  route: GuideDetailRouteProp;
}

const GUIDE_DETAILS = {
  // Cleaning guides
  boiling: {
    title: 'Đun sôi nước',
    icon: '🔥',
    content: [
      {
        heading: 'Tại sao cần Đun sôi?',
        body: 'Đun sôi là phương pháp đơn giản và hiệu quả nhất để tiêu diệt hầu hết các vi khuẩn, virus và ký sinh trùng trong nước. Nhiệt độ 100°C có thể tiêu diệt 99.9% các tác nhân gây bệnh.',
      },
      {
        heading: 'Cách thực hiện',
        body: '1. Đun sôi nước trong nồi sạch\n2. Duy trì sôi liên tục ít nhất 1 phút (ở độ cao > 2000m thì 3 phút)\n3. Để nguội tự nhiên trong nồi đậy kín\n4. Bảo quản trong bình sạch, dùng trong 24 giờ',
      },
      {
        heading: 'Lưu ý quan trọng',
        body: '• Không thêm bất kỳ chất gì vào nước khi đun\n• Sử dụng nồi sạch, không có mùi kim loại\n• Nước sau khi đun không loại bỏ được chất ô nhiễm hóa học\n• Không tái đun nước đã đun sôi',
      },
    ],
  },
  filtration: {
    title: 'Lọc nước',
    icon: '🏠',
    content: [
      {
        heading: 'Các phương pháp lọc cơ bản',
        body: 'Lọc nước tại nhà có thể loại bỏ các hạt lớn, cặn và một số vi khuẩn. Có nhiều phương pháp lọc khác nhau phù hợp với các tình huống khác nhau.',
      },
      {
        heading: 'Lọc bằng vải',
        body: 'Sử dụng khăn sạch, vải cotton hoặc khăn lọc cà phê để lọc nước. Phương pháp này loại bỏ cặn và một số tạp chất lớn.',
      },
      {
        heading: 'Lọc than hoạt tính',
        body: 'Than hoạt tính có thể hấp thụ một số chất ô nhiễm hữu cơ và cải thiện mùi vị của nước.',
      },
      {
        heading: 'Lọc cát',
        body: 'Lớp cát sạch có thể lọc bỏ các hạt nhỏ và một số vi khuẩn. Thường dùng trong các hệ thống lọc tự nhiên.',
      },
    ],
  },
  chlorination: {
    title: 'Khử trùng bằng clo',
    icon: '🧴',
    content: [
      {
        heading: 'Nguyên lý hoạt động',
        body: 'Clo là chất khử trùng mạnh, có thể tiêu diệt vi khuẩn, virus và một số ký sinh trùng. Clo phản ứng với nước tạo thành axit hypoclorơ, chất này phá hủy cấu trúc tế bào của vi sinh vật.',
      },
      {
        heading: 'Cách sử dụng clo tinh khiết',
        body: '• Nồng độ: 1mg/L cho nước trong, 2-3mg/L cho nước đục\n• Thời gian: 30 phút cho nước trong, 1 giờ cho nước đục\n• Mùi clo nhẹ sau xử lý là bình thường',
      },
      {
        heading: 'Sử dụng nước Javel',
        body: '• Pha loãng nước Javel (5% clo) theo tỷ lệ 1:100\n• Thêm 2 giọt dung dịch pha loãng vào 1 lít nước\n• Thời gian chờ: 30 phút',
      },
      {
        heading: 'Lưu ý an toàn',
        body: '• Không sử dụng clo đã hết hạn\n• Bảo quản clo ở nơi khô ráo, thoáng mát\n• Tránh hít phải hơi clo nồng\n• Nước sau khi khử trùng không để quá 24 giờ',
      },
    ],
  },
  uv_light: {
    title: 'Tia UV',
    icon: '💡',
    content: [
      {
        heading: 'Nguyên lý tia UV',
        body: 'Tia cực tím có bước sóng 254nm có thể phá hủy DNA của vi khuẩn, virus và ký sinh trùng, ngăn chúng sinh sản.',
      },
      {
        heading: 'Thiết bị UV',
        body: '• Đèn UV chuyên dụng cho xử lý nước\n• Hệ thống lọc UV công nghiệp\n• Thiết bị di động dùng pin',
      },
      {
        heading: 'Thời gian chiếu xạ',
        body: '• Nước trong: 30-60 giây\n• Nước đục nhẹ: 1-2 phút\n• Nước rất đục: cần lọc trước',
      },
      {
        heading: 'Ưu và nhược điểm',
        body: 'Ưu: Không thay đổi mùi vị, không tạo chất phụ\nNhược: Không loại bỏ chất ô nhiễm hóa học, cần nguồn điện',
      },
    ],
  },

  // Classification guides
  color_analysis: {
    title: 'Phân tích màu sắc nước',
    icon: '🎨',
    content: [
      {
        heading: 'Nước trong suốt (tốt)',
        body: 'Màu: Trong suốt, không màu\nÝ nghĩa: Nước sạch, không có tạp chất hữu cơ hoặc vô cơ\nHành động: Có thể sử dụng trực tiếp',
      },
      {
        heading: 'Nước vàng nhạt',
        body: 'Màu: Vàng nhạt đến nâu nhạt\nNguyên nhân: Chất hữu cơ, sắt, mangan\nĐánh giá: Cần kiểm tra thêm các thông số khác',
      },
      {
        heading: 'Nước đỏ gạch',
        body: 'Màu: Đỏ gạch hoặc cam\nNguyên nhân: Sắt (Fe) hoặc mangan (Mn) cao\nHành động: Cần xử lý lọc hoặc khử trùng',
      },
      {
        heading: 'Nước xanh lục',
        body: 'Màu: Xanh lục\nNguyên nhân: Tảo hoặc vi khuẩn lam\nHành động: Không sử dụng, cần xử lý chuyên nghiệp',
      },
      {
        heading: 'Nước đen',
        body: 'Màu: Đen hoặc xám đen\nNguyên nhân: Hữu cơ phân hủy, mangan\nHành động: Cần xử lý ngay, không sử dụng',
      },
    ],
  },
  ph_measurement: {
    title: 'Đo độ pH của nước',
    icon: '🧪',
    content: [
      {
        heading: 'Độ pH là gì?',
        body: 'pH đo độ axit hoặc bazơ của nước. Thang đo từ 0-14, 7 là trung tính.',
      },
      {
        heading: 'pH 6.5-8.5 (tốt cho uống)',
        body: 'Nước uống lý tưởng. Không gây ăn mòn đường ống, không tạo váng với xà phòng.',
      },
      {
        heading: 'pH < 6.5 (axit)',
        body: 'Nguyên nhân: CO2, axit tự nhiên\nHậu quả: Ăn mòn kim loại, vị chua\nHành động: Có thể uống nhưng nên trung hòa',
      },
      {
        heading: 'pH > 8.5 (bazo)',
        body: 'Nguyên nhân: Khoáng chất, xử lý nước\nHậu quả: Vị đắng, tạo váng xà phòng\nHành động: Có thể uống nhưng kiểm tra khoáng chất',
      },
      {
        heading: 'pH < 4 hoặc > 11 (nguy hiểm)',
        body: 'Không phù hợp uống. Có thể gây ngộ độc hoặc ăn mòn.',
      },
    ],
  },
  odor_detection: {
    title: 'Phát hiện mùi nước',
    icon: '👃',
    content: [
      {
        heading: 'Mùi clo nhẹ (bình thường)',
        body: 'Mùi clo nhẹ sau xử lý nước. An toàn, bay hơi nhanh.',
      },
      {
        heading: 'Mùi trứng thối (không tốt)',
        body: 'Nguyên nhân: Vi khuẩn khử sulfat, hydro sulfua\nHành động: Không sử dụng, cần khử trùng mạnh',
      },
      {
        heading: 'Mùi đất hoặc mốc',
        body: 'Nguyên nhân: Vi khuẩn, chất hữu cơ phân hủy\nHành động: Lọc và khử trùng',
      },
      {
        heading: 'Mùi dầu hoặc hóa chất',
        body: 'Nguyên nhân: Ô nhiễm công nghiệp\nHành động: Không sử dụng, báo cơ quan chức năng',
      },
      {
        heading: 'Mùi kim loại',
        body: 'Nguyên nhân: Sắt, đồng từ đường ống\nHành động: Kiểm tra hệ thống ống nước',
      },
    ],
  },
  turbidity_check: {
    title: 'Kiểm tra độ đục',
    icon: '🌊',
    content: [
      {
        heading: 'Độ đục là gì?',
        body: 'Đo lượng hạt lơ lửng trong nước. Đơn vị NTU (Nephelometric Turbidity Unit).',
      },
      {
        heading: '< 1 NTU (rất tốt)',
        body: 'Nước rất trong, phù hợp uống trực tiếp.',
      },
      {
        heading: '1-5 NTU (tốt)',
        body: 'Nước trong, có thể có một số hạt nhỏ.',
      },
      {
        heading: '5-10 NTU (trung bình)',
        body: 'Nước hơi đục, cần theo dõi và xử lý.',
      },
      {
        heading: '> 10 NTU (kém)',
        body: 'Nước đục, có thể chứa vi khuẩn. Cần lọc trước khi dùng.',
      },
      {
        heading: 'Cách đo độ đục tại nhà',
        body: '• Quan sát bằng mắt thường\n• So sánh với mẫu chuẩn\n• Sử dụng thiết bị đo chuyên dụng',
      },
    ],
  },

  // Emergency guides
  poisoning_symptoms: {
    title: 'Triệu chứng ngộ độc nước',
    icon: '⚠️',
    content: [
      {
        heading: 'Ngộ độc vi khuẩn',
        body: '• Tiêu chảy, nôn mửa\n• Đau bụng, sốt\n• Mất nước, mệt mỏi\n• Xuất hiện sau 6-24 giờ',
      },
      {
        heading: 'Ngộ độc hóa chất',
        body: '• Buồn nôn, nôn\n• Đau đầu, chóng mặt\n• Co giật, hôn mê (nặng)\n• Xuất hiện ngay hoặc vài giờ',
      },
      {
        heading: 'Ngộ độc kim loại nặng',
        body: '• Đau bụng, nôn\n• Tiêu chảy có máu\n• Vàng da, suy thận\n• Triệu chứng chậm (tuần-tháng)',
      },
      {
        heading: 'Ngộ độc nitrat',
        body: '• Thiếu oxy máu ở trẻ em\n• Da xanh, khó thở\n• Co giật, hôn mê\n• Cần cấp cứu ngay',
      },
    ],
  },
  first_aid: {
    title: 'Cấp cứu ban đầu',
    icon: '🚑',
    content: [
      {
        heading: 'Ngộ độc cấp tính',
        body: '1. Ngừng tiếp xúc với nguồn nước\n2. Uống nhiều nước lọc hoặc oresol\n3. Theo dõi triệu chứng\n4. Gọi cấp cứu nếu nặng',
      },
      {
        heading: 'Tiêu chảy nặng',
        body: '• Bù nước: oresol, nước lọc\n• Ăn thức ăn nhẹ, dễ tiêu\n• Tránh sữa và chất béo\n• Theo dõi dấu hiệu mất nước',
      },
      {
        heading: 'Nôn mửa',
        body: '• Uống từ từ, từng ngụm nhỏ\n• Tránh ăn trong 2-3 giờ\n• Nằm nghiêng để tránh sặc\n• Gọi bác sĩ nếu nôn ra máu',
      },
      {
        heading: 'Sốt cao',
        body: '• Lau mát bằng nước ấm\n• Uống nhiều nước\n• Thuốc hạ sốt nếu cần\n• Giám sát nhiệt độ',
      },
    ],
  },
  medical_attention: {
    title: 'Tìm kiếm y tế',
    icon: '🏥',
    content: [
      {
        heading: 'Khi nào đi khám ngay',
        body: '• Mất nước nặng (>5% trọng lượng cơ thể)\n• Sốt >39°C không hạ\n• Tiêu chảy ra máu\n• Nôn ra máu hoặc mật\n• Co giật, lú lẫn\n• Trẻ em <2 tuổi có triệu chứng',
      },
      {
        heading: 'Các xét nghiệm cần thiết',
        body: '• Công thức máu\n• Điện giải đồ\n• Xét nghiệm nước tiểu\n• Xét nghiệm phân\n• Xét nghiệm mẫu nước (nếu có)',
      },
      {
        heading: 'Điều trị y tế',
        body: '• Bù nước và điện giải\n• Kháng sinh (nếu nhiễm khuẩn)\n• Thuốc chống nôn\n• Theo dõi và điều trị biến chứng',
      },
      {
        heading: 'Phòng ngừa tái phát',
        body: '• Sử dụng nguồn nước an toàn\n• Rửa tay thường xuyên\n• Bảo quản thực phẩm đúng cách\n• Tiêm phòng khi cần thiết',
      },
    ],
  },
  prevention: {
    title: 'Phòng ngừa ngộ độc nước',
    icon: '🛡️',
    content: [
      {
        heading: 'Nguồn nước an toàn',
        body: '• Sử dụng nước máy đã qua xử lý\n• Đun sôi nước nếu nghi ngờ\n• Sử dụng nước đóng chai uy tín\n• Lọc nước bằng thiết bị chất lượng',
      },
      {
        heading: 'Vệ sinh cá nhân',
        body: '• Rửa tay trước ăn và sau đi vệ sinh\n• Rửa sạch rau quả\n• Bảo quản thực phẩm đúng nhiệt độ\n• Không ăn đồ sống nếu nghi ngờ',
      },
      {
        heading: 'Giáo dục cộng đồng',
        body: '• Học cách nhận biết nước an toàn\n• Biết các triệu chứng ngộ độc\n• Hiểu cách xử lý khẩn cấp\n• Báo cáo nguồn nước nghi ngờ',
      },
      {
        heading: 'Kiểm tra định kỳ',
        body: '• Kiểm tra chất lượng nước định kỳ\n• Bảo dưỡng hệ thống lọc nước\n• Theo dõi sức khỏe gia đình\n• Cập nhật kiến thức mới',
      },
    ],
  },
};

function GuideDetailScreen({ route }: GuideDetailProps) {
  const { guideId } = route.params;
  const guideDetail = GUIDE_DETAILS[guideId as keyof typeof GUIDE_DETAILS];

  if (!guideDetail) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin hướng dẫn</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={['#1e3a8a', '#2563eb', '#93c5fd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerIcon}>{guideDetail.icon}</Text>
        <Text style={styles.headerTitle}>{guideDetail.title}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {guideDetail.content.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});

export default GuideDetailScreen;