import QRCode from 'qrcode';

export async function handleQRCode(text: string): Promise<string> {

    try {
        const qrCode = await QRCode.toDataURL(text);

        return qrCode;
    } catch (err) {
        return '';
    }
}
