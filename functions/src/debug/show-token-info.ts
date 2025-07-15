// src/debug/show-token-info.ts

import { Request, Response } from 'express';
import axios from 'axios';

export const showTokenInfoHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = req.query.access_token as string;
    if (!accessToken) {
      res.status(400).json({ error: 'Missing access_token' });
      return;
    }

    const response = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: accessToken },
    });

    res.status(200).json({
      token_info: response.data,
    });
  } catch (error: any) {
    console.error('[showTokenInfoHandler] Error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};
