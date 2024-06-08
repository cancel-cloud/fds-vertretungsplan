// src/pages/_document.tsx
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import Header from "@/components/Header";
import React from "react";
import Footer from "@/components/Footer";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Header></Header>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className="mx-auto w-auto">
          <Main />
          <NextScript />
        </body>
        <Footer></Footer>
      </Html>
    );
  }
}

export default MyDocument;
