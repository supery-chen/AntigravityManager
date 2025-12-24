import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GeminiRequest, GeminiResponse } from '../interfaces/request-interfaces';

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  // Default to v1beta for most features
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async streamGenerate(model: string, content: GeminiRequest, accessToken: string): Promise<any> {
    const url = `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse`;

    try {
      const response = await axios.post(url, content, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Gemini Stream API Error: ${error.message}`);
        throw new Error(error.response?.data?.error?.message || error.message);
      }
      throw error;
    }
  }

  async generate(
    model: string,
    content: GeminiRequest,
    accessToken: string,
  ): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${model}:generateContent`;

    try {
      const response = await axios.post<GeminiResponse>(url, content, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60s timeout
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Gemini API Error: ${error.message} - ${JSON.stringify(error.response?.data)}`,
        );
        throw new Error(error.response?.data?.error?.message || error.message);
      }
      throw error;
    }
  }
}
