import { Html, Head, Main, NextScript } from "next/document";
import { useRouter } from "next/router";

export default function Document({ locale }: { locale: string }) {
  // const { locale } = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Html lang={locale} dir={dir}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: any) => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);
  const { locale } = ctx;

  return { ...initialProps, locale };
};
