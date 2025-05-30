/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { uploadImageToIPFS } from "@/lib/filebase";

interface GenerateImageResponse {
  nftIpfsUrl: string;
  img: string;
}
export const generateImage = async (
    imageBuffer: any
): Promise<GenerateImageResponse | null> => {
  try {
   
    const ipfsUrl = await uploadImageToIPFS(imageBuffer);
    if (!ipfsUrl) {
      console.error("Error: Image upload to IPFS failed.");
      return null;
    }
    // NFT metadata object
    const nftMetadata = {
      name: "MONAD BLITZ BANGALORE",
      image: ipfsUrl,
      attributes: [
        {
          trait_type: "Status",
          value: "FUN MINTED ON MONAD",
        },
      ],
    };
    const nftObjBuffer = Buffer.from(JSON.stringify(nftMetadata));
    // 👇 Upload as buffer
    const nftIpfsUrl = await uploadImageToIPFS(nftObjBuffer);
    if (!nftIpfsUrl) {
      console.error("Error: NFT metadata upload to IPFS failed.");
      return null;
    }

    return {
      nftIpfsUrl,
      img: ipfsUrl,
    };
  } catch (error: any) {
    console.error(
      "Error generating image:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate image. Please try again later.");
  }
};
