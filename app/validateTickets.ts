import type { Request, Response } from "express";
import { prisma } from "./db.server";

async function validateTicket(req: Request, res: Response) {
  const { ticketId } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        price: true,
        user: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket && ticket.event && ticket.user) {
      return res.status(200).json({ message: "Ticket is valid", ticket });
    } else {
      return res.status(400).json({ message: "Ticket is invalid" });
    }
  } catch (error) {
    console.error("Validation failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default validateTicket;
