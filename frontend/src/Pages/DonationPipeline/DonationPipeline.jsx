import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import AuthVerify from "@/helper/jwtVerify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

const DonationPipeline = () => {
  const navigate = useNavigate();
  const [donationGroups, setDonationGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!AuthVerify()) navigate("/login");
  }, []);

  // Fetch donation pipeline data
  useEffect(() => {
    const fetchDonationPipeline = async () => {
      try {
        const response = await fetch(`/api/allotment/donation-pipeline`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch donation pipeline");
        }
        const data = await response.json();
        setDonationGroups(data.data || []);
      } catch (error) {
        toast.error("Error fetching donation pipeline");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationPipeline();
  }, [token]);

  // Handle processing a donation
  const handleProcessDonation = async (donationId, sponsorId) => {
    try {
      const response = await fetch(`/api/allotment/process-donation`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ donationId, sponsorId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process donation");
      }

      toast.success("Donation processed successfully!");

      // Refresh the list
      const updatedGroups = donationGroups
        .map((group) => ({
          ...group,
          donations: group.donations.filter((d) => d._id !== donationId),
        }))
        .filter((group) => group.donations.length > 0);

      setDonationGroups(updatedGroups);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex select-none">
      {/* Sidebar */}
      <div className="sticky top-0 flex flex-col gap-10 sidebar w-[21%] h-screen pl-[10px] pr-[10px] border-r border-r-[#DDE4EB]">
        <Link to="/">
          <div className="logo w-full">
            <img src="/logos.png" alt="logos" className="object-contain" />
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="hero flex flex-col w-[80%] bg-fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(222,80,85,0.4),transparent),radial-gradient(ellipse_at_top_left,rgba(205,214,219,0.8),rgba(255,255,255,0.8),rgba(255,255,255,0)),radial-gradient(ellipse_at_top_right,rgba(205,214,219,0.8),rgba(255,255,255,0.8),rgba(255,255,255,0)),radial-gradient(ellipse_at_bottom_left,rgba(205,214,219,0.8),rgba(255,255,255,0.8),rgba(255,255,255,0)),radial-gradient(ellipse_at_bottom_right,rgba(205,214,219,0.8),rgba(255,255,255,0.8),rgba(255,255,255,0))]">
        <div className="heading text-3xl font-semibold text-center pt-5 pb-5 border-b w-full">
          Donation Pipeline
        </div>

        <div className="content w-[90%] m-auto mt-10 pb-10">
          {donationGroups.length > 0 ? (
            <div className="flex flex-col gap-8">
              {donationGroups.map((group) => (
                <div key={group.userId} className="border rounded-lg p-6 bg-white shadow-md">
                  {/* User Details Header */}
                  <div className="mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold mb-2">{group.userName}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold">{group.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Batch</p>
                        <p className="font-semibold">{group.userBatch || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Currently Sponsored</p>
                        <p className="font-semibold text-lg">{group.currentSponsoredCount} students</p>
                      </div>
                    </div>
                  </div>

                  {/* Donations List */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Pending Donations</h3>
                    {group.donations.map((donation) => (
                      <div
                        key={donation._id}
                        className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-gray-600 text-sm">Academic Year</p>
                              <p className="font-semibold">{donation.academicYear}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm">New Children Count</p>
                              <p className="font-semibold text-lg">{donation.numChild}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm">Donation Amount</p>
                              <p className="font-semibold">₹{donation.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm">Donation Date</p>
                              <p className="font-semibold">
                                {new Date(donation.donationDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Display sponsored students if any */}
                          {donation.studentsToSponsor && donation.studentsToSponsor.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <p className="text-gray-600 text-sm font-semibold mb-2">Students to Sponsor:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {donation.studentsToSponsor.map((student) => (
                                  <div key={student._id} className="text-sm bg-white p-2 rounded border border-blue-100">
                                    <p className="font-semibold text-blue-700">{student.studentName}</p>
                                    <p className="text-gray-600">{student.rollNumber} - Class {student.class}</p>
                                    <p className="text-gray-500">{student.centre}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Process Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="ml-4">Process Donation</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Process Donation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="space-y-2">
                                  {group.currentSponsoredCount < donation.numChild && (
                                    <p>
                                      ✓ Will allot{" "}
                                      <span className="font-bold">
                                        {donation.numChild - group.currentSponsoredCount}
                                      </span>
                                      new child(ren) for sponsorship
                                    </p>
                                  )}
                                  {group.currentSponsoredCount > donation.numChild && (
                                    <p>
                                      ✗ Will de-allot{" "}
                                      <span className="font-bold">
                                        {group.currentSponsoredCount - donation.numChild}
                                      </span>
                                      child(ren) from sponsorship
                                    </p>
                                  )}
                                  {group.currentSponsoredCount === donation.numChild && (
                                    <p>
                                      ○ No change in sponsorship (renewal for{" "}
                                      <span className="font-bold">{donation.numChild}</span>
                                      children)
                                    </p>
                                  )}
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleProcessDonation(donation._id, group.userId)
                                }
                              >
                                Confirm & Process
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">
                No pending donations in the pipeline
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationPipeline;
