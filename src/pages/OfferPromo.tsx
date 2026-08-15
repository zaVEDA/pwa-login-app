import LegalDoc from "@/components/legal/LegalDoc";

export default function OfferPromo() {
  return (
    <LegalDoc
      src="/offer-promo.md"
      downloadUrl="/dopolnenie-1-akciya-shablon.docx"
      downloadName="Дополнение-1-акция-шаблон.docx"
      downloadLabel="Скачать DOCX"
      notice="Черновик на согласовании. Страница доступна только по прямой ссылке и пока не опубликована на сайте."
    />
  );
}
