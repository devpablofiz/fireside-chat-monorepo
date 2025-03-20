import axios from "axios";

const API_BASE_URL = "http://192.168.1.104:3000";

export const createChat = async (token: string, chatName: string) => {
    const res = await axios.post(
        `${API_BASE_URL}/createChat`,
        {chatName},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return res.data;
};

export const sendMessage = async (token: string, chatId: string, message: string) => {
    const res = await axios.post(
        `${API_BASE_URL}/sendMessage`,
        {chatId, message},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return res.data;
};
