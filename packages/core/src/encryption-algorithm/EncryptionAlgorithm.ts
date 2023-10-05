import crypto from 'crypto';
/**
 * 加解密的
 */
class EncryptionAlgorithm {
    /**
     * AES编码
     * @param {string} data 数据
     * @param {string} key 密钥
     * @returns {Buffer} 解码后的数据
     */
    public static aesEncrypt(data: string, key: string): Buffer {
        const iv = key.substring(0, 16);
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        const encrypted = cipher.update(data);
        return Buffer.concat([encrypted, cipher.final()]);
    }

    /**
     * AES解码
     * @param {string} encryptedData 加密后的数据
     * @param {string} key 密钥
     * @returns {string} 解码后的数据
     */
    public static aesDecrypt(encryptedData: string, key: string): string {
        const iv = key.substring(0, 16);
        const encryptedText = Buffer.from(encryptedData, 'base64');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    /**
     * RSA加密
     * @param {string} pemStr 公钥
     * @param {string} encryptKey 加密的key
     * @returns {string} 加密后的数据
     */
    public static PKCS1Encrypt(pemStr: string, encryptKey: string): string {
        const publicKey = crypto.createPublicKey(pemStr);

        return crypto
            .publicEncrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                Buffer.from(encryptKey),
            )
            .toString('base64');
    }

    /**
     * RSA解密
     * @param pemStr 公钥
     * @param decryptKey 解密的key
     * @returns {string} 解密后的数据
     */
    public static PKCS1Decrypt(pemStr: string, decryptKey: string): string {
        const privateKey = crypto.createPrivateKey(pemStr);

        return crypto
            .privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                Buffer.from(decryptKey, 'base64'),
            )
            .toString();
    }
}

export default EncryptionAlgorithm;
