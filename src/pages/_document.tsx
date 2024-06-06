// src/pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <body className="w-auto mx-auto">
                <Main />
                <NextScript />
                
                </body>
            </Html>
        )
    }
}

export default MyDocument
