"use server";
import prisma from "@/lib/prisma";

// function for Get data from database
export async function getUserDetails(userId: any) {
  try {
    // Use Prisma to fetch the user with the given userId and include related DashTable records
    const userWithTables = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dashTable: true,
      },
    });

    if (userWithTables) {
      // Extract the relevant data from the fetched user
      const dashTableData = userWithTables.dashTable.map((table) => ({
        ProjectName: table.ProjectName,
        // TemplateId: table.TemplateId,
        LastSaved: table.LastSaved,
        userId: table.userId,
      }));

      return dashTableData;
    }

    return [];
  } catch (error) {
    // Handle errors (e.g., log or throw)
    console.error("Error fetching user details:", error);
    throw error;
  }
}
