# Tự dạy lập trình trong mười năm

*[Bản gốc](https://norvig.com/21-days.html) được viết bởi Peter Norvig.
Được dịch sang tiếng Việt bởi Lê Duy Quang (leduyquang753 tại gmail.com).*

## Tại sao ai cũng vội vã như vậy?

Hãy bước vào bất kì nhà sách nào, và bạn sẽ thấy làm thế nào để *Tự dạy Java
trong 24 giờ* bên cạnh vô số biến thể dạy C, SQL, Ruby, thuật toán, và vân vân
trong vòng vài ngày hoặc vài tuần. Tìm kiếm nâng cao trên Amazon cho
[`title: teach, yourself, hours, since: 2000`](https://www.amazon.com/gp/search/ref=sr_adv_b/?search-alias=stripbooks&unfiltered=1&field-keywords=&field-author=&field-title=teach+yourself+hours&field-isbn=&field-publisher=&node=&field-p_n_condition-type=&field-feature_browse-bin=&field-subject=&field-language=&field-dateop=After&field-datemod=&field-dateyear=2000&sort=relevanceexprank&Adv-Srch-Books-Submit.x=16&Adv-Srch-Books-Submit.y=5)
(tức là tiêu đề có những từ khóa có nghĩa "dạy", "bản thân", "giờ" và xuất bản
từ năm 2000) cho ra 512 quyển sách như vậy. Trong số top 10, chín là sách lập
trình (quyển còn lại là về kế toán). Các kết quả tương tự đến từ việc thay
"teach yourself" ("tự dạy") thành "learn" ("học") hay "hours" ("giờ") thành
"days" ("tuần").

Kết luận là hoặc là mọi người đang trong một cơn rất vội vã để học về lập trình,
hoặc là lập trình bằng cách nào đó dễ hơn một cách khó tin để học so với bất kì
cái gì khác. Felleisen và cộng sự đã gật đầu với xu hướng này trong quyển sách
của họ
[*Cách thiết kế chương trình*](https://www.ccs.neu.edu/home/matthias/HtDP2e/index.html),
nói rằng "Lập trình tồi rất dễ. *Những kẻ ngốc* có thể học nó trong *21 ngày*,
kể cả khi họ là *những thằng đần độn*." Truyện tranh *Con ngỗng khó hiểu* cũng
có [màn thể hiện riêng](https://abstrusegoose.com/249).

Hãy cùng phân tích một tựa đề như
[*Tự dạy C++ trong 24 giờ*](https://www.amazon.com/Sams-Teach-Yourself-Hours-5th/dp/0672333317/ref=sr_1_6?s=books&ie=UTF8&qid=1412708443&sr=1-6&keywords=learn+c%2B%2B+days)
có thể có nghĩa như thế nào:

- **Tự dạy**: Trong 24 giờ bạn sẽ không có thời gian để viết vài chương trình
nổi bật, và học tập từ những thành công và thất bại của bạn với chúng. Bạn sẽ
không có thời gian để làm việc với một lập trình viên kinh nghiệm và hiểu cảm
giác sống trong một môi trường C++. Tóm lại, bạn sẽ không có thời gian để học
nhiều. Cho nên quyển sách chỉ có thể nói về một sự quen thuộc hời hợt, không
phải sự hiểu biết sâu sắc. Như Alexander Pope đã nói, chỉ học một chút là một
điều nguy hiểm.
- **C++**: Trong 24 giờ bạn có thể có khả năng học một số cú pháp của C++ (nếu
bạn đã biết một ngôn ngữ khác), nhưng bạn không thể học nhiều về cách sử dụng
ngôn ngữ. Tóm lại, nếu bạn là, ví dụ, một lập trình viên BASIC, bạn có thể học
viết chương trình theo hơi hướng BASIC dùng cú pháp C++, nhưng bạn không thể
biết C++ thực sự là tốt (hay xấu) cho cái gì. Vậy mục đích là gì?
[Alan Perlis](https://www-pu.informatik.uni-tuebingen.de/users/klaeren/epigrams.html)
một lần từng nói: "Một ngôn ngữ mà không ảnh hưởng tới cách bạn nghĩ về lập
trình, thì không đáng để biết." Một điều có thể có là bạn phải học một chút xíu
C++ (hoặc nhiều khả năng hơn, thứ gì đó như JavaScript hay Processing) bời vì
bạn cần thao tác với một công cụ có sẵn để hoàn thành một công việc cụ thể.
Nhưng khi đó thì bạn đang không học cách lập trình; bạn đang học cách hoàn thành
công việc đó.
- **trong 24 giờ**: Thật không may, ngần này là không đủ, như phần tiếp theo sẽ
cho thấy.

## Tự dạy lập trình trong mười năm

Các nhà nghiên cứu
([Bloom (1985)](https://www.amazon.com/exec/obidos/ASIN/034531509X/),
[Bryan & Harter (1899)](#Tư-liệu-tham-khảo),
[Hayes (1989)](https://www.amazon.com/exec/obidos/ASIN/0805803092),
[Simon & Chase (1973)](#Tư-liệu-tham-khảo)) đã cho thấy phải mất mười năm để
phát triển sự thông thạo ở bất kì lĩnh vực gì trong một phạm vi rộng, bao gồm
chơi cờ, soạn nhạc, thao tác điện tín, vẽ, chơi piano, bơi, chơi tennis, và
nghiên cứu trong tâm lí học thần kinh và tô pô. Mấu chốt ở đây là luyện tập *có
chủ đích*: không chỉ làm đi làm lại, mà là tự thử thách bản thân với một nhiệm
vụ vừa vượt quá khả năng hiện tại của bạn, cố gắng, phân tích quá trình của bạn
trong và sau khi thực hiện, và sửa những lỗi sai. Rồi lặp lại. Rồi lặp lại nữa.
Trông có vẻ như không có con đường tắt thật sự nào: ngay cả Mozart, người từng
là thân đồng âm nhạc khi 4 tuổi, phải mất 13 năm nữa trước khi ông bắt đầu cho
ra đời âm nhạc tầm cỡ thế giới. Trong một thể loại khác, The Beatles trông như
bùng nổ trên sân khấu với một chuỗi bản hit số 1 và một lần xuất hiện trong
chương trình Ed Sullivan năm 1964. Nhưng họ đã từng chơi trong những câu lạc bộ
nhỏ ở Liverpool và Hamburg từ 1957, và trong khi họ nhận được sự hâm mộ lớn từ
sớm, thành công lớn đầu tiên của họ, *Sgt. Peppers*, được ra mắt năm 1967.

[Malcolm Gladwell](https://www.amazon.com/Outliers-Story-Success-Malcolm-Gladwell/dp/0316017922)
đã truyền bá ý tưởng, mặc dù ông tập trung vào 10 000 giờ, không phải 10 năm.
Henri Cartier-Bresson (1908 – 2004) có một thang đo khác: "10 000 tấm ảnh đầu
tiên của bạn là tệ nhất." (Ông không lường trước rằng với máy ảnh kĩ thuật số,
một số người có thể đạt tới mốc đó trong một tuần.) Sự thông thạo thật sự có thể
tốn cả một cuộc đời: Samuel Johnson (1709 – 1784) đã nói: "Sự xuất sắc trong bất
kì lĩnh vực nào có thể đạt được chỉ bằng công sức của cả cuộc đời; nó không mua
lại được bằng một mức giá thấp hơn." Và Chaucer (1340 – 1400) đã than phiền:
"đời ngắn quá, nghề học quá lâu". Hippocrates (từ 400 TCN) được biết đến qua cụm
trích "ars longa, vita brevis", là một phần trong một đoạn dẫn dài hơn: "Ars
longa, vita brevis, occasio praeceps, experimentum periculosum, iudicium
difficile", mà trong tiếng Việt tạm dịch thành "Đời là ngắn, nghề lại dài, cơ
hội thoáng qua, kinh nghiệm quý giá, đánh giá khó khăn". Tất nhiên, không một
con số đơn lẻ nào có thể là đáp số cuối cùng: nó trông không được hợp lí để giả
định rằng mọi kĩ năng (như lập trình, chơi cờ vua, chơi cờ đam, và chơi nhạc)
phải yêu cầu chính xác cùng một lượng thời gian để làm chủ, cũng không phải rằng
ai cũng tốn một lượng thời gian như nhau. Như Giáo sư
[K. Anders Ericsson](https://www.amazon.com/K.-Anders-Ericsson/e/B000APB8AQ/ref=dp_byline_cont_book_1)
chỉ ra, "Trong phần lớn lĩnh vực thật đáng ghi nhận bao nhiêu thời gian kể cả
những người tài năng nhất cần để đạt đến những bậc cao nhất trong sự nghiệp. Con
số 10 000 giờ chỉ cho bạn một khái niệm rằng chúng ta đang nói về những năm với
10 đến 20 giờ mỗi tuần mà với đó một số người cho rằng là lượng mà những người
tài năng nhất vẫn cần để vươn tới đỉnh cao."

## Thế là bạn muốn làm lập trình viên

Đây là công thức của tôi cho thành công trong lập trình:

- Có **hứng thú** với lập trình, và làm việc đó vì nó vui. Đảm bảo rằng nó sẽ
vẫn vui như vậy đủ cho bạn bỏ vào 10 năm/10 000 giờ của bạn.
- **Lập trình.** Kiểu học tốt nhất là
[vừa học vừa làm](https://www.engines4ed.org/hyperbook/nodes/NODE-120-pg.html).
Nói văn hoa hơn, "mức phong độ cao nhất cho những cá nhân trong một lĩnh vực cho
trước không được đạt đến một cách tự động như là một hàm của kinh nghiệm lâu
dài, nhưng mức phong độ có thể được tăng lên kể cả bởi những người có rất nhiều
kinh nghiệm như là một kết quả của những cố gắng có chủ đích để cải thiện."
([trang 366](https://www2.umassd.edu/swpi/DesignInCS/expertise.html)) và "việc
học có hiệu quả nhất yêu cầu một công việc cụ thể với một mức độ thích hợp cho
cá nhân cụ thể, phản hồi cung cấp thông tin, và cơ hội lặp lại và sửa chữa sai
sót." (trang 20; 21) Quyển [*Nhận thức trong thực tế: lí trí, toán học, và văn
hóa trong cuộc sống hàng ngày*](https://www.amazon.com/exec/obidos/ASIN/0521357349)
là một chỗ tham khảo đáng chú ý cho góc nhìn này.
- **Nói chuyện** với những lập trình viên khác; đọc những chương trình của họ.
Điều này quan trong hơn tất cả những cuốn sách hay những khóa học.
- Nếu bạn muốn, bỏ ra bốn năm tại một **trường đại học** (hoặc nhiều hơn tại một
trường cao học). Điều này sẽ cho bạn bước chân vào những công việc yêu cầu bằng
cấp, và nó sẽ cho bạn sự hiểu biết sâu hơn về ngành, nhưng nếu bạn không thích
trường lớp, bạn có thể (với sự nhiệt huyết) có được kinh nghiệm tương tự trên
chính đôi chân của mình hay trong công việc. Trong bất kì trường hợp nào, chỉ
học qua sách vở thôi sẽ là không đủ. "Đào tạo khoa học máy tính không có khả
năng biến bất kì ai thành lập trình viên chuyên nghiệp hơn so với việc học về
cây cọ và bột màu có thể biến ai đó thành một họa sĩ xuất sắc" theo Eric
Raymond, tác giả của *Từ điển cho hacker thế hệ mới*. Một trong những lập trình
viên giỏi nhất tôi từng thuê chỉ có bằng Trung học; anh đã cho ra đời rất nhiều
[phần mềm](https://www.mozilla.org/) [có giá trị](https://www.xemacs.org/), có
[nhóm tin tức](https://groups.google.com/groups?q=alt.fan.jwz&meta=site%3Dgroups)
của riêng mình, và kiếm được từ chứng khoán đủ để mua một
[hộp đêm](https://en.wikipedia.org/wiki/DNA_Lounge) riêng.
- Làm những **dự án cùng** những lập trình viên khác. Trở thành lập trình viên
giỏi nhất trong một số dự án; trở thành tệ nhất trong một số khác. Khi bạn là
giỏi nhất, bạn được thử khả năng lãnh đạo một dự án, và được truyền cảm hứng cho
người khác về tầm nhìn của bạn. Khi bạn là tệ nhất, bạn học những gì mà những
người chủ làm, và bạn học những gì họ không thích làm (bởi vì họ khiến bạn làm
hộ cho họ).
- Làm những **dự án *theo*** những lập trình viên khác. Tìm hiểu một chương
trình được viết bởi ai đó khác. Xem cần những gì để hiểu và sửa chữa nó khi lập
trình viên ban đầu không ở xung quanh. Nghĩ về cách thiết kế những chương trình
của bạn để làm nó dễ hơn cho những người sẽ tiếp quản chúng cho bạn.
- Học ít nhất một nửa tá **ngôn ngữ lập trình**. Bao gồm một ngôn ngữ nhấn mạnh
vào trừu tượng hóa thành lớp (như Java hay C++), một nhấn mạnh trừu tượng hóa
thành hàm (như Lisp hay ML hay Haskell), một hỗ trợ khai báo tường minh (như
Prolog hay template C++), và một nhấn mạnh sự song song (như Clojure hay Go).
- Nhớ rằng có một chữ "**máy tính**" trong "khoa học máy tính". Biết được mất
bao lâu để máy tính của bạn chạy một chỉ dẫn, lấy một từ từ bộ nhớ (có hay không
có việc trượt cache), đọc những từ liên tiếp nhau từ đĩa, và chuyển tới một vị
trí mới trong đĩa. ([Đáp số ở đây.](#Đáp-số))
- Tham gia vào một nỗ lực **chuẩn hóa** ngôn ngữ. Nó có thể là ủy ban C++ ANSI,
hoặc nó có thể là quyết định xem liệu phong cách code của bạn sẽ có các bậc thụt
dòng là 2 hay 4 dấu cách. Dù thế nào, bạn học những gì người khác thích về một
ngôn ngữ, họ cảm thấy thế đến mức độ bao nhiêu, và có lẽ kể cả một chút về lí do
họ cảm thấy như vậy.
- Có một ý thức tốt để **nhảy ra** khỏi nỗ lực chuẩn hóa ngôn ngữ đó càng sớm
càng tốt.

Với tất cả những cái đó trong đầu, có câu hỏi rằng bạn có thể tiến xa bao nhiêu
chỉ bằng cách học sách vở. Trước khi đứa con đầu tiên của tôi chào đời, tôi đã
đọc hết những quyển *Cách làm*, và vẫn cảm thấy như một người tập sự mông lung.
30 tháng sau, khi đã có đến đứa con thứ hai, tôi có quay lại những quyển sách để
ôn lại không? Không. Thay vào đó, tôi dựa vào kinh nghiệm cá nhân của bản thân,
mà lại đâm ra hữu ích và an tâm hơn nhiều so với hàng ngàn trang sách của những
nhà chuyên môn.

Fred Brooks, trong tiểu luận
[*Không có viên đạn bạc*](https://en.wikipedia.org/wiki/No_Silver_Bullet) đã chỉ
ra một kế hoạch ba phần để tìm ra những kĩ sư phần mềm giỏi:

1. Tìm có phương pháp những nhà thiết kế hàng đầu càng sớm càng tốt.
2. Giao cho một giáo viên có nghề mang trọng trách phát triển tiềm năng và cẩn
thận lưu lại một hồ sơ sự nghiệp.
3. Tạo cơ hội cho các nhà thiết kế đang phát triển tương tác và kích thích lẫn
nhau.

Kế hoạch này giả định một số người đã có những phẩm chất cần thiết để trở thành
nhà thiết kế giỏi; công việc chỉ là dẫn dắt họ theo đúng cách. Alan Perlis cô
đọng lại: "Ai cũng có thể được dạy điêu khắc: Michelangelo sẽ phải được dạy để
không làm vậy. Cũng như vậy với những lập trình viên giỏi." Perlis đang nói rằng
những người giỏi có một phẩm chất bên trong vượt qua quá trình đào tạo của họ.
Nhưng phẩm chất này đến từ đâu? Nó có phải bẩm sinh? Hay họ phát triển nó qua sự
kiên trì? Như Auguste Gusteau (đầu bếp giả tưởng trong *Ratatouille*) chỉ ra,
"ai cũng có thể nấu ăn, nhưng chỉ những ai không biết sợ mới giỏi." Tôi nghĩ về
nó nhiều hơn như là sự sẵn sàng cống hiến phần lớn cuộc đời của một con người để
luyện tập có chủ đích. Nhưng có thể *không biết sợ* là một cách để tổng kết điều
đó. Hoặc, như người phê bình Gusteau, Anton Ego, nói: "Không phải ai cũng có thể
trở thành nghệ sĩ giỏi, nhưng nghệ sĩ giỏi có thể đến từ bất kì đâu."

Vậy nên hãy cứ đi tiếp và mua quyển Java/Ruby/JavaScript/PHP đó; bạn có thể sẽ
tìm ra một chút tác dụng từ nó. Nhưng bạn sẽ không thay đổi cuộc đời của bạn,
hay sự thông thạo thực sự nói chung của bạn trong vai một lập trình viên trong
24 giờ hay 21 ngày. Làm việc hết sức để liên tục cải thiện trong vòng 24 tháng
thì sao? Ừ, lúc này thì bạn đang bắt đầu đi đến đâu đó rồi đấy...

## Tư liệu tham khảo

Bloom, Benjamin (biên tập) –
[*Developing talent in young people*](https://www.amazon.com/exec/obidos/ASIN/034531509X)
– Ballantine, 1985.

Brooks, Fred – [*No silver bullets*](https://citeseer.nj.nec.com/context/7718/0)
– IEEE computer, tập 20, số 4, 1987, trang 10 ÷ 19.

Bryan, W.L. & Harter, N. – *Studies on the telegraphic language: The acquisition
of a hierarchy of habits* – Psychology review, 1899, 8, 345 ÷ 375.

Hayes, John R. –
[*Complete problem solver*](https://www.amazon.com/exec/obidos/ASIN/0805803092)
– Lawrence Erlbaum, 1989.

Chase, Willian G. & Simon, Herbert A. –
[*Perception in chess*](https://books.google.com/books?id=dYPSHAAACAAJ&dq=%22perception+in+chess%22+simon&ei=z4PyR5iIAZnmtQPbyLyuDQ)
– Cognitive psychology, 1973, 4, 55 ÷ 81.

Lave, Jean –
[*Cognition in practice: Mind, mathematics, and culture in everyday life*](https://www.amazon.com/exec/obidos/ASIN/0521357349)
– Cambridge university press, 1988.

## Đáp số

Thời gian xấp xỉ cho một số thao tác trên một PC điển hình:

| Thao tác | Thời gian (nano giây) |
| :--- | ---: |
| Chạy một chỉ dẫn điển hình | 1 |
| Lấy từ cache L1 | 0,5 |
| Đoán trượt nhánh | 5 |
| Lấy từ cache L2 | 7 |
| Khóa/Mở khóa mutex | 25 |
| Lấy từ bộ nhớ chính | 100 |
| Gửi 2 KB qua mạng 1 Gbps | 20 000 |
| Đọc 1 MB tuần tự từ bộ nhớ | 250 000 |
| Chuyển qua vị trí đĩa mới | 8 000 000 |
| Đọc 1 MB tuần tự từ đĩa | 20 000 000 |
| Gửi gói tin từ Mĩ tới châu Âu và quay lại | 150 000 000 |

## Phụ lục: Lựa chọn ngôn ngữ

Nhiều người đã hỏi họ nên chọn học ngôn ngữ nào. Không có câu trả lời duy nhất
nào, nhưng hãy xem xét những điểm sau:

- *Hỏi bạn của bạn.* Khi được hỏi "tôi nên dùng hệ điều hành gì, Windows, UNIX,
hay Mac?", câu trả lời của tôi thường là: "dùng cái gì các bạn của bạn dùng."
Lợi thế bạn có được từ việc học tập từ những người bạn sẽ át đi những sự khác
biệt về bản chất giữa những hệ điều hành, hay giữa những ngôn ngữ lập trình.
Ngoài ra cũng xem xét những người bạn tương lai của bạn: cộng đồng lập trình
viên mà bạn sẽ trở thành một phần nếu bạn bước tiếp. Ngôn ngữ bạn chọn liệu đang
có một cộng đồng lớn đang phát triển hay là một cộng đồng nhỏ bé đang chết dần?
Có sách, website, và diễn đàn online nào để tìm kiếm câu trả lời không? Bạn có
thích mọi người trong những diễn đàn đó không?
- *Giữ cho nó đơn giản.* Những ngôn ngữ lập trình như C++ hay Java được thiết kế
cho phát triển phần mềm chuyên nghiệp bởi những đội lớn gồm những lập trình viên
dày dạn kinh nghiệm quan tâm đến hiệu năng khi chạy của code của họ. Kết quả là,
những ngôn ngữ này có những phần phức tạp được thiết kế cho những hoàn cảnh đó.
Bạn đang quan tâm đến việc học lập trình. Bạn không cần những sự phức tạp đó.
Bạn muốn một ngôn ngữ được thiết kế để dễ học và dễ nhớ cho một người mới học
lập trình.
- *Vui chơi.* Bạn muốn học đánh piano kiểu gì: kiểu bình thường, tương tác, mà
bạn nghe mỗi nốt ngay khi bạn nhấn một phím, hay chế độ "hàng loạt", mà bạn chỉ
nghe thấy những nốt nhạc khi bạn đã hoàn thành cả bản nhạc? Rõ ràng, kiểu tương
tác làm việc học dễ dàng hơn cho piano, và cũng cho lập trình. Xác định với một
ngôn ngữ với chế độ tương tác và sử dụng nó.

Với những điều kiện trên, những sự tiến cử của tôi cho một ngôn ngữ lập trình
đầu tiên sẽ là [Python](https://python.org/) hay
[Scheme](https://www.schemers.org/). Một lựa chọn khác là JavaScript, không phải
vì nó được thiết kế tốt hoàn hảo cho người mới, mà là vì có rất nhiều hướng dẫn
online cho nó, như
[hướng dẫn của Khan academy](https://www.khanacademy.org/computing/cs/programming).
Nhưng hoàn cảnh của bạn có thể khác nhau, và có những lựa chọn tốt khác. Nếu
tuổi bạn chỉ có một chữ số, bạn có thể thích [Alice](https://alice.org/) hay
[Squeak](https://www.squeak.org/) hay
[Blockly](https://blockly-demo.appspot.com/static/apps/index.html) (những người
học lớn tuổi hơn cũng có thể thích). Điều quan trọng là bạn chọn lấy và bắt đầu
với nó.

## Phụ lục: Sách và những tài nguyên khác

Nhiều người đã hỏi những quyển sách và trang web nào họ nên học. Tôi lặp lại
rằng "chỉ sách vở thôi là không đủ" nhưng tôi có thể đề cử như sau:

- **Scheme**:
[*Cấu trúc và cách đọc chương trình máy tính* (Abelson & Sussmann)](https://www.amazon.com/gp/product/0262011530)
có lẽ là lời dẫn đầu tốt nhất đến với lập trình, và nó dạy lập trình như là một
cách để hiểu khoa học máy tính. Bạn có thể xem
[video online của các bài giảng](https://www.swiss.ai.mit.edu/classes/6.001/abelson-sussman-lectures/)
trong quyển sách này, cũng như
[trọn vẹn văn bản online](https://mitpress.mit.edu/sicp/full-text/book/book.html).
Quyển sách này mang tính thử thách và sẽ loại bỏ một số người mà có lẽ có thể
thành công với một phương pháp khác.
- **Scheme**:
[*Cách thiết kế chương trình* (Felleisen và cộng sự)](https://www.amazon.com/gp/product/0262062186)
là một trong những quyển sách tốt nhất về cách thực sự thiết kế chương trình
theo cách trong sáng và có hiệu quả.
- **Python**:
[*Lập trình Python: một mở đầu cho khoa học máy tính* (Zelle)](https://www.amazon.com/gp/product/1887902996)
là một sự mở đầu tốt cho việc sử dụng Python.
- **Python**: Nhiều [bài hướng dẫn](https://wiki.python.org/moin/BeginnersGuide)
có thể được truy cập trên [python.org](https://python.org/).
- **Oz**:
[*Khái niệm, kĩ thuật, và mô hình lập trình máy tính* (Van Roy & Haridi)](https://www.amazon.com/gp/product/0262220695)
được một số cho rằng là sự nối tiếp thời hiện đại cho Abelson & Sussman. Nó là
một tour qua những ý tưởng lớn về lập trình, bao quát một khoảng rộng hơn
Abelton & Sussman trong khi có lẽ dễ đọc và theo dõi hơn. Nó sử dụng một ngôn
ngữ, Oz, mà không được biết đến nhiều nhưng là một nền tảng để học những ngôn
ngữ khác.

## Ghi chú

T\. Capey chỉ ra rằng trang
[*Giải quyết vấn đề trọn vẹn*](https://www.amazon.com/exec/obidos/ASIN/0805803092)
trên Amazon giờ có những quyển *Tự dạy tiếng Bengal trong 21 ngày* và *Tự dạy
ngữ pháp và văn phong* trong danh mục "Khách hàng mua món này cũng mua những
món sau". Tôi đoán rằng một phần lớn những người nhìn thấy quyển sách đó là đến
từ trang này. Xin cảm ơn Ross Cohen vì sự giúp đỡ về Hippocrates.