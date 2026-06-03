import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Model order to try. If the first model hits a 429, fall through to the next.
 * gemini-1.5-flash has a higher free-tier RPM/RPD than gemini-2.0-flash.
 * You can override the first model via GEMINI_MODEL env var.
 */
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
  "gemini-1.5-flash-8b",   // smallest – highest free-tier quota
  "gemini-2.0-flash-lite", // last fallback
];

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const LABEL_PROMPT_TEMPLATE = `Bạn là chuyên gia gán nhãn cảm xúc cho văn bản tiếng Việt để phục vụ hệ thống Text-to-Speech (TTS).

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

Tất cả ký tự xuống dòng phải được escape thành \\n.

Không được xuất hiện ký tự xuống dòng thực tế trong kết quả.

Các đoạn liên tiếp phải được nối bằng \\n\\n.

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

[storytelling]Ngày xửa ngày xưa, có một cậu bé sống trong ngôi làng nhỏ.[/storytelling]\\n\\n[storytelling]Một hôm cậu tìm thấy một túi vàng.[/storytelling]\\n\\n[storytelling]Cậu vui mừng chạy về nhà và hét lên:[/storytelling]\\n\\n[happy]Mẹ ơi, con tìm thấy vàng rồi.[/happy]\\n\\n[storytelling]Hôm sau số vàng biến mất.[/storytelling]\\n\\n[storytelling]Cậu tức giận nói:[/storytelling]\\n\\n[angry]Ai đã lấy vàng của tôi.[/angry]

Bây giờ hãy gán nhãn cho câu chuyện sau:

{{STORY}}`;

/** Sleep for `ms` milliseconds */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Extract the retry delay (seconds) from a Gemini 429 response body.
 * Falls back to `defaultSeconds` if not found.
 */
function parseRetryDelay(body: unknown, defaultSeconds = 30): number {
  try {
    const details = (
      body as { error?: { details?: { retryDelay?: string }[] } }
    )?.error?.details;
    if (!Array.isArray(details)) return defaultSeconds;
    for (const d of details) {
      if (d?.retryDelay) {
        const secs = parseInt(String(d.retryDelay).replace(/[^0-9]/g, ""), 10);
        if (!isNaN(secs)) return secs;
      }
    }
  } catch {
    // ignore parse errors
  }
  return defaultSeconds;
}

class GeminiQuotaError extends Error {
  isQuotaError = true;
}

/**
 * Call Gemini with automatic model fallback on 429.
 * Tries each model in GEMINI_MODELS order.
 * For each model, retries once after the suggested delay on the first 429.
 * Returns the labeled text content on success.
 */
async function callGeminiWithFallback(
  apiKey: string,
  prompt: string
): Promise<string> {
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
  });

  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
    let lastErrBody: unknown = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (res.ok) {
        const data = await res.json();
        const text: string =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) return text;
        throw new Error("Gemini trả về kết quả rỗng");
      }

      lastErrBody = await res.json().catch(() => null);
      console.warn(
        `Gemini [${model}] attempt ${attempt + 1} → ${res.status}`,
        lastErrBody
      );

      if (res.status === 429) {
        if (attempt === 0) {
          // Wait the suggested delay then retry once on the same model
          const delaySecs = parseRetryDelay(lastErrBody, 25);
          console.log(`Rate limited on ${model}. Retrying in ${delaySecs}s…`);
          await sleep(delaySecs * 1000);
          continue;
        }
        // Second 429 on this model → move to next model
        break;
      }

      // Non-429 error – don't try other models
      throw new Error(`Gemini API lỗi ${res.status} (model: ${model})`);
    }

    console.warn(`Model ${model} quota exhausted, trying next model…`);
  }

  // All models exhausted
  throw new GeminiQuotaError(
    "Tất cả model Gemini đều hết quota free-tier. " +
      "Vui lòng thử lại sau vài phút hoặc kích hoạt billing tại https://ai.dev/rate-limit"
  );
}

/**
 * POST /api/label
 * Calls Gemini API to apply emotion labels to raw story text.
 */
export async function POST(request: Request) {
  // Check admin authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY chưa được cấu hình trong .env" },
      { status: 500 }
    );
  }

  try {
    const { textContent } = await request.json();

    if (!textContent || typeof textContent !== "string") {
      return NextResponse.json(
        { error: "Missing required field: textContent" },
        { status: 400 }
      );
    }

    const prompt = LABEL_PROMPT_TEMPLATE.replace("{{STORY}}", textContent);
    const labeledContent = await callGeminiWithFallback(apiKey, prompt);

    return NextResponse.json({ labeledContent });
  } catch (error) {
    console.error("Label route error:", error);

    if (error instanceof GeminiQuotaError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Lỗi khi gán nhãn cảm xúc",
      },
      { status: 500 }
    );
  }
}
