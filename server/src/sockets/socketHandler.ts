import { Server, Socket } from "socket.io";
import { Message } from "../models/Message"; // Ensure your model is also using TypeScript

// Define a type for the message data to ensure type safety
interface MessageData {
  fromUserId: string;
  toUserId: string;
  message: string;
  imageName: string | null;
  room: string;
  sentAt: Date;
  _id: string;
}

const socketHandler = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    socket.on("join_room", (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("send_message", async (data: MessageData) => {
      socket.to(data.room).emit("receive_message", data);
      console.log("room:", data.room)
      console.log("Message sent:", data);
      const newMessage = new Message({
        room: data.room,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        message: data.message,
        imageName: data.imageName,
        sentAt: data.sentAt,
        _id: data._id,
      });
      console.log(newMessage);
      // Add to MongoDB database
      try {
        await newMessage.save();
        console.log("Message saved to database");
      } catch (error) {
        console.error("Error saving message to database:", error);
      }
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });
  });
};

export default socketHandler;
