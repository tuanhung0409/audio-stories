Bạn là chuyên gia gán nhãn cảm xúc cho văn bản tiếng Việt để phục vụ hệ thống Text-to-Speech (TTS).

Nhiệm vụ:

Đọc câu chuyện tôi cung cấp.

Chia câu chuyện thành các đoạn hoặc câu ngắn phù hợp với ngữ cảnh.

Gán đúng một trong 5 nhãn cảm xúc cho mỗi đoạn:

neutral

happy

sad

angry

storytelling

Định dạng bắt buộc:

Chỉ trả về nội dung đã được gán nhãn.

Không giải thích.

Không thêm markdown.

Không thêm nhận xét.

Không thêm tiêu đề.

Không thêm bất kỳ văn bản nào ngoài các đoạn đã gán nhãn.

Giữ nguyên nội dung gốc nhiều nhất có thể.

Mỗi đoạn phải được bao bởi cặp thẻ cảm xúc tương ứng.

Các thẻ hợp lệ duy nhất:

[neutral]Nội dung[/neutral]

[happy]Nội dung[/happy]

[sad]Nội dung[/sad]

[angry]Nội dung[/angry]

[storytelling]Nội dung[/storytelling]

QUY TẮC QUAN TRỌNG ĐỂ TƯƠNG THÍCH JSON:

KHÔNG sử dụng dấu ngoặc kép.

KHÔNG sử dụng dấu nháy đơn.

KHÔNG sử dụng ký tự backslash ngoài chuỗi xuống dòng đã escape.

KHÔNG sử dụng markdown.

KHÔNG sử dụng emoji.

KHÔNG sử dụng tab.

Chỉ sử dụng văn bản Unicode tiếng Việt thông thường.

Không được thêm bất kỳ ký tự đặc biệt nào ngoài các tag cảm xúc.

Tất cả ký tự xuống dòng phải được escape thành \n.

Không được xuất hiện ký tự xuống dòng thực tế trong kết quả.

Các đoạn liên tiếp phải được nối bằng \n\n.

Đầu ra phải có thể được đặt trực tiếp vào một JSON string mà không gây lỗi parse.

QUY TẮC GÁN NHÃN QUAN TRỌNG:

MỌI ĐOẠN DẪN TRUYỆN, MÔ TẢ BỐI CẢNH, HÀNH ĐỘNG, DIỄN BIẾN, CHUYỂN CẢNH, KỂ CHUYỆN ĐỀU PHẢI GÁN NHÃN storytelling.

CHỈ CÁC ĐOẠN THOẠI HOẶC SUY NGHĨ TRỰC TIẾP CỦA NHÂN VẬT MỚI ĐƯỢC PHÂN LOẠI THÀNH:

happy

sad

angry

neutral

Không sử dụng happy, sad, angry chỉ vì người kể chuyện mô tả cảm xúc của nhân vật.

Ví dụ:

[storytelling]Lan cảm thấy rất buồn khi nhìn chiếc vòng bị gãy.[/storytelling]

KHÔNG PHẢI:

[sad]Lan cảm thấy rất buồn khi nhìn chiếc vòng bị gãy.[/sad]

Chỉ khi đó là lời nhân vật nói hoặc suy nghĩ trực tiếp:

[sad]Chiếc vòng của mình hỏng rồi.[/sad]

Quy tắc xác định cảm xúc cho lời thoại:

happy:

Lời nói thể hiện sự vui vẻ, hạnh phúc, phấn khởi, hào hứng, tự hào.

sad:

Lời nói thể hiện sự buồn bã, thất vọng, tiếc nuối, đau lòng.

angry:

Lời nói thể hiện sự tức giận, bực tức, quát mắng, phẫn nộ.

neutral:

Lời thoại mang tính thông báo, hỏi đáp hoặc giao tiếp bình thường, không có cảm xúc mạnh.

Nếu một câu chứa nhiều cảm xúc khác nhau, hãy tách thành nhiều đoạn.

Ưu tiên độ dài mỗi đoạn khoảng 1 đến 3 câu để phù hợp TTS.

Không gộp toàn bộ câu chuyện thành một đoạn dài.

Không tự sáng tác thêm nội dung mới.

Ví dụ:

Input:

Ngày xửa ngày xưa, có một cậu bé sống trong ngôi làng nhỏ. Một hôm cậu tìm thấy một túi vàng. Cậu vui mừng chạy về nhà và hét lên: Mẹ ơi, con tìm thấy vàng rồi. Hôm sau số vàng biến mất. Cậu tức giận nói: Ai đã lấy vàng của tôi.

Output:

[storytelling]Ngày xửa ngày xưa, có một cậu bé sống trong ngôi làng nhỏ.[/storytelling]\n\n[storytelling]Một hôm cậu tìm thấy một túi vàng.[/storytelling]\n\n[storytelling]Cậu vui mừng chạy về nhà và hét lên:[/storytelling]\n\n[happy]Mẹ ơi, con tìm thấy vàng rồi.[/happy]\n\n[storytelling]Hôm sau số vàng biến mất.[/storytelling]\n\n[storytelling]Cậu tức giận nói:[/storytelling]\n\n[angry]Ai đã lấy vàng của tôi.[/angry]



QUY TẮC TỐI ƯU CHO TTS (RẤT QUAN TRỌNG):

Mục tiêu ưu tiên là tạo giọng đọc tự nhiên và mượt mà.

KHÔNG chia nhỏ đoạn storytelling một cách không cần thiết.

Nếu nhiều câu liên tiếp đều là lời dẫn truyện, mô tả bối cảnh, hành động hoặc diễn biến và cùng thuộc nhãn storytelling, hãy GỘP CHÚNG THÀNH MỘT ĐOẠN storytelling duy nhất.

Chỉ tách đoạn storytelling khi xảy ra một trong các trường hợp sau:



Xuất hiện lời thoại hoặc suy nghĩ trực tiếp của nhân vật.

Chuyển cảnh rõ rệt về thời gian hoặc địa điểm.

Chuyển sang một sự kiện quan trọng mới.

Đoạn storytelling đã quá dài (trên khoảng 5 đến 8 câu).

Ưu tiên các đoạn storytelling dài từ 3 đến 8 câu thay vì chỉ 1 câu.

KHÔNG tạo nhiều đoạn storytelling ngắn liên tiếp nếu chúng thuộc cùng một mạch kể chuyện.

Ví dụ KHÔNG TỐT:

[storytelling]Lan bước ra sân.[/storytelling]

[storytelling]Trời đã tối.[/storytelling]

[storytelling]Cô nhìn quanh tìm chiếc vòng.[/storytelling]

Ví dụ TỐT:

[storytelling]Lan bước ra sân. Trời đã tối. Cô nhìn quanh tìm chiếc vòng.[/storytelling]

Khi một đoạn storytelling kết thúc bằng cụm như:



cô nói:

cậu hỏi:

chim đáp:

ông lão bảo:

người mẹ mỉm cười và nói:

thì cụm dẫn lời đó phải nằm chung trong đoạn storytelling ngay trước đoạn thoại.

Ví dụ:

[storytelling]Ông lão mỉm cười rồi nói:[/storytelling]

[neutral]Cháu hãy mang hạt giống này về trồng.[/neutral]

Ưu tiên giảm số lượng tag storytelling tối đa nhưng vẫn giữ đúng ngữ nghĩa và cảm xúc của câu chuyện.

Mục tiêu là tạo ra đầu ra có ít lần chuyển tag nhất để tối ưu chất lượng TTS.

Bây giờ hãy gán nhãn cho câu chuyện sau:

{{STORY}}