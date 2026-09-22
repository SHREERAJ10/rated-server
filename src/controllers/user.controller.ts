import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { User } from "../models/user.model.js";

export const activateUser = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const { username, displayName, bio, pfpUrl } = User.parse(req.body);
    const user = await userService.activateUser(
      id,
      username,
      displayName,
      bio ?? "",
      pfpUrl,
    );
    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await userService.getUser(username);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const fetchUser = async (req: Request, res: Response) => {
  try {
    const userId = req.uid ?? "";
    const user = await userService.fetchUser(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getOnboardingStatus = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const user = await userService.getOnboardingStatus(id);
    const response = user ? { userOnboard: true } : { userOnboard: false };
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const updateNotificationStatus = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    await userService.updateNotificationStatus(id);
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getNotificationStatus = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const isNotificationRead = await userService.isNotificationRead(id);
    const payload = {
      isNotificationRead: isNotificationRead,
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);

    const intervalId = setInterval(async () => {
      const isNotificationRead = await userService.isNotificationRead(id);
      const payload = {
        isNotificationRead: isNotificationRead,
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }, 1000 * 30);

    req.on("close", () => {
      clearInterval(intervalId);
      res.end();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getNotification = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const notificationId = req.query.cursor;
    const cursor = notificationId
      ? {
          id: notificationId,
        }
      : null;

    const notifications = await userService.getNotifications(id, cursor);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};
