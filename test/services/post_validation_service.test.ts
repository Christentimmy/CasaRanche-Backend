import { PostValidationService } from "../../src/services/post_validation_service";
import { Request } from "express";

import User from "../../src/models/user_model";

// Mock the User model
jest.mock("../../src/models/user_model", () => ({
  findById: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockImplementation(() => Promise.resolve()),
  })),
}));

describe("PostValidationService", () => {
  describe("validateBasicRequirements", () => {
    it("should throw an error when no content is provided", async () => {
      const mockReq = {
        body: {},
        files: [],
      } as unknown as Request;

      await expect(
        PostValidationService.validateBasicRequirements(mockReq, "user123")
      ).rejects.toThrow("Post must contain text, media, poll, or be a repost");
    });

    it("should not throw an error when text is provided", async () => {
      const mockReq = {
        body: { text: "Hello world" },
        files: [],
      } as unknown as Request;

      await expect(
        PostValidationService.validateBasicRequirements(mockReq, "user123")
      ).resolves.not.toThrow();
    });

    it("should not throw an error when files are provided", async () => {
      const mockReq = {
        body: {},
        files: [{ filename: "test.jpg" }],
      } as unknown as Request;

      await expect(
        PostValidationService.validateBasicRequirements(mockReq, "user123")
      ).resolves.not.toThrow();
    });

    it("should not throw an error when poll is provided", async () => {
      const mockReq = {
        body: {
          poll: {
            question: "Test?",
            options: ["A", "B"],
          },
        },
        files: [],
      } as unknown as Request;

      await expect(
        PostValidationService.validateBasicRequirements(mockReq, "user123")
      ).resolves.not.toThrow();
    });

    it("should not throw an error when originalPostId is provided", async () => {
      const mockReq = {
        body: { originalPostId: "123" },
        files: [],
      } as unknown as Request;

      await expect(
        PostValidationService.validateBasicRequirements(mockReq, "user123")
      ).resolves.not.toThrow();
    });
  });

  describe("validateUser", () => {
    const mockUser = {
      _id: "user123",
      ghostProgression: 1,
      accountStatus: "active",
      school: "Test University",
      work: "Test Company",
      isVerified: true,
      username: "testuser",
      anonymousId: "anon123",
    };

    beforeEach(() => {
      jest.clearAllMocks();

      // Set up default mock implementation with proper chaining
      (User.findById as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser),
      }));
    });

    it("should return user data when user exists", async () => {
      // Set up specific mock for this test
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      (User.findById as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await PostValidationService.validateUser("user123");

      // Verify the calls
      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(selectMock).toHaveBeenCalledWith(
        "ghostProgression accountStatus school work isVerified username anonymousId"
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error when user is not found", async () => {
      // Override the default mock for this test
      (User.findById as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue(null),
      }));

      await expect(
        PostValidationService.validateUser("nonexistent")
      ).rejects.toThrow("User not found");
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";

      // Override the default mock for this test
      (User.findById as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockRejectedValue(new Error(errorMessage)),
      }));

      await expect(
        PostValidationService.validateUser("user123")
      ).rejects.toThrow(errorMessage);
    });
  });
});
