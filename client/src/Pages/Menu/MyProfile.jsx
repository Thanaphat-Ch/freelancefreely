import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, Calendar, Briefcase, Edit2, Save, X, Award, FileText, Globe, Settings, Heart } from "lucide-react"
import api from "../../api/axios"
import BackButton from "../../Components/BackButton"
import { FreelancerCard, JobCard, ReviewCard, SectionCard } from "../../Components/Card"
// import { formatPhone } from "../../utils/Format"
import FreelancerProfileModal from "../../Components/CreateFreelancerProfile"

const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [originalData, setOriginalData] = useState(null)

  const [freelanceprofile, setFreelanceprofile] = useState([])
  const [myJobs, setMyJobs] = useState([])

  const [reviews, setReviews] = useState([])
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const [avatarFile, setAvatarFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)

  const [hiredJobs, setHiredJobs] = useState([])
  const [workingJobs, setWorkingJobs] = useState([])

  const [editData, setEditData] = useState(null)

  const stats = [
    { label: "งานที่สมัคร", value: myJobs?.length || "-", icon: Briefcase },
    { label: "งานที่เสร็จ", value: myJobs?.filter((job) => job.status === "completed")?.length || "-", icon: Award },
    { label: "คะแนน", value: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : "-", icon: Star },
    { label: "วันที่เข้าร่วม", value: profileData?.joinDate || "-", icon: Calendar },
    // { label: "ประสบการณ์", value: profileData?.experience || "-", icon: Briefcase },
  ]
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get("/reviews/me")
        setReviews(res.data || [])
      } catch (err) {
        console.error("Fetch review failed", err)
      }
    }
    fetchReview()
  }, [])

  const fetchJobs = async () => {
    try {
      const [myJobRes, freelancerres] = await Promise.all([api.get("/jobs/me"), api.get("/freelancers/me")])
      const { hiredJobs = [], workingJobs = [] } = myJobRes.data
      const mergedJobs = [...hiredJobs, ...workingJobs]

      setMyJobs(mergedJobs || [])
      setHiredJobs(myJobRes.data.hiredJobs || [])
      setWorkingJobs(myJobRes.data.workingJobs || [])
      setFreelanceprofile(freelancerres.data || [])
    } catch (err) {
      console.error("Fetch jobs failed", err)
    }
  }

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [myJobRes, freelancerres] = await Promise.all([api.get("/jobs/me"), api.get("/freelancers/me")])
        const { hiredJobs = [], workingJobs = [] } = myJobRes.data
        const mergedJobs = [...hiredJobs, ...workingJobs]

        setMyJobs(mergedJobs || [])
        setHiredJobs(myJobRes.data.hiredJobs || [])
        setWorkingJobs(myJobRes.data.workingJobs || [])
        setFreelanceprofile(freelancerres.data || [])
      } catch (err) {
        console.error("Fetch jobs failed", err)
      }
    }
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/me`)
        const data = {
          ...res.data,
          joinDate: new Date(res.data.created_at).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }
        localStorage.setItem("profilePic", JSON.stringify(res.data.profilePicture))
        setProfileData(data)
        setOriginalData(data)
      } catch (err) {
        console.error("Fetch profile failed:", err)
      }
    }
    fetchProfile()
    fetchJobs()
  }, [])

  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(profileData.profilePicture)
      }
    }
  }, [avatarFile])

  if (!profileData) return null

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append("name", profileData.name || "")
      formData.append("bio", profileData.bio || "")
      formData.append("skills", JSON.stringify(profileData.skills || []))
      if (avatarFile) {
        formData.append("profilePicture", avatarFile)
      }
      if (resumeFile) {
        formData.append("resume", resumeFile)
      }
      if (!profileData.resume && originalData.resume) {
        formData.append("removeResume", "true")
      }

      const res = await api.put(
        "/users",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
        { timeout: 60000 },
      )

      setProfileData(res.data)
      setOriginalData(res.data)
      setAvatarFile(null)
      setResumeFile(null)
      setIsEditing(false)
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  const handleCancel = () => {
    setProfileData(originalData)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-1 min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-10 w-full">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold">{profileData.profilePicture ? <img src={profileData.profilePicture} alt="profile" className="w-full h-full rounded-full object-cover" /> : profileData.name?.[0]}</div>

                {isEditing && (
                  <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow cursor-pointer">
                    <Edit2 size={14} className="text-indigo-600" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        setAvatarFile(file)
                        const previewUrl = URL.createObjectURL(file)
                        setProfileData({
                          ...profileData,
                          profilePicture: previewUrl,
                        })
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="min-h-8">{isEditing ? <input className={inputBase + " text-xl font-bold text-center"} value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} /> : <h1 className="text-xl font-bold">{profileData.name}</h1>}</div>

              {isEditing ? (
                <textarea rows={4} className={inputBase + " bg-gray-200 mt-2"} value={profileData.bio || ""} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} />
              ) : (
                <p className="text-slate-600 text-sm text-left p-4 bg-gray-100 rounded-xl h-32">{profileData.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              {/* <h3 className="font-bold mb-4">สถิติ</h3> */}
              <div className="space-y-3">
                {stats.map((s, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                      <s.icon size={18} className="text-indigo-600" />
                      {s.label}
                    </div>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard title="ทักษะ">
              {/* skills */}
              {isEditing ? (
                <input
                  className={inputBase}
                  value={(profileData.skills || []).join(", ")}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      skills: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {(profileData.skills || []).map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Resume */}
              <div className="mt-4">
                <p className="text-md font-semibold mb-2">Resume</p>
                {isEditing ? (
                  profileData.resumeName ? (
                    <div className="flex items-center justify-between border border-indigo-300 rounded-xl px-4 py-3 bg-indigo-50">
                      <div className="flex items-center gap-2 text-indigo-700">
                        <FileText size={16} />
                        <span className="text-sm font-medium truncate">{profileData.resumeName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResumeFile(null)
                          setProfileData({
                            ...profileData,
                            resume: null,
                            resumeName: null,
                          })
                        }}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* 📤 Upload */
                    <label className="border-2 border-dashed border-indigo-300 rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition">
                      <FileText size={16} className="text-indigo-400 mr-2" />
                      <p className="text-sm text-indigo-600 font-medium">คลิกเพื่ออัปโหลด Resume (PDF)</p>
                      <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (!file) return

                          setResumeFile(file)
                          setProfileData({
                            ...profileData,
                            resumeName: file.name,
                          })
                        }}
                      />
                    </label>
                  )
                ) : profileData.resume ? (
                  <a href={profileData.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm font-medium">
                    <FileText size={16} />
                    {profileData.resumeName || "Resume.pdf"}
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm">ยังไม่มี Resume</p>
                )}
              </div>
            </SectionCard>

            {/* <SectionCard title="ข้อมูลติดต่อ">
              <Field icon={Mail} label="อีเมล">
                <p>{profileData.email}</p>
              </Field>

              <Field icon={Phone} label="โทรศัพท์">
                {isEditing ? (
                  <input
                    className={inputBase}
                    inputMode="numeric"
                    placeholder="0XX-XXX-XXXX"
                    value={profileData.phone || ""}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      setProfileData({
                        ...profileData,
                        phone: formatted,
                      })
                    }}
                  />
                ) : (
                  <p>{profileData.phone || "-"}</p>
                )}
              </Field>

              <Field icon={MapPin} label="ที่อยู่">
                {isEditing ? <input className={inputBase} value={profileData.address || ""} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} /> : <p>{profileData.address}</p>}
              </Field>

              <Field icon={Globe} label="เว็บไซต์">
                {isEditing ? (
                  <input className={inputBase} value={profileData.website || ""} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} />
                ) : (
                  <a href={profileData.website} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                    {profileData.website}
                  </a>
                )}
              </Field>
            </SectionCard> */}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm flex justify-between items-center">
              <h2 className="text-xl font-bold">ข้อมูลโปรไฟล์</h2>
              <div className="flex gap-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg flex items-center gap-1">
                      <Save size={14} /> บันทึก
                    </button>
                    <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-slate-200 rounded-lg flex items-center gap-1">
                      <X size={14} /> ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm hover:bg-gray-200 hover:text-indigo-600 rounded-lg flex items-center gap-1">
                    <Edit2 size={16} />
                  </button>
                )}
                <Link to="/settings" className="items-center p-2 hover:bg-gray-200 hover:text-amber-700 rounded-md">
                  <Settings size={20} />
                </Link>
              </div>
            </div>

            <SectionCard
              className="h-[700px] overflow-y-auto"
              overflow={true}
              tab={[
                { label: "จ้างงาน", key: "hiredJobs" },
                { label: "รับงาน", key: "workingJobs" },
                { label: "โปรไฟล์", key: "freelanceprofile" },
                { label: "รีวิว", key: "review" },
              ]}
            >
              {(activeTab) => (
                <div className="space-y-4">
                  {activeTab === "freelanceprofile" &&
                    (freelanceprofile.length === 0 ? (
                      <>
                        <div className="flex justify-between">
                          <div className="text-sm sm:text-lg flex gap-2 my-2">
                            <p>โปรไฟล์ของฉัน </p>
                            <p className="text-indigo-600">{freelanceprofile.length}</p>
                            <p>โปรไฟล์ </p>
                          </div>
                          <button onClick={() => setIsPostModalOpen(true)} className="w-32 sm:w-32 md:w-36 justify-center flex items-center bg-indigo-600 text-white hover:bg-indigo-800 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                            เพิ่มงานของฉัน
                          </button>
                        </div>
                        <div className="flex-1 my-20">
                          <EmptyState text="คุณยังไม่มีโปรไฟล์ฟรีแลนซ์ที่สร้างไว้" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <div className="text-sm sm:text-lg flex gap-2 my-2">
                            <p>โปรไฟล์ของฉัน </p>
                            <p className="text-indigo-600">{freelanceprofile.length}</p>
                            <p>โปรไฟล์ </p>
                          </div>
                          <button onClick={() => setIsPostModalOpen(true)} className="w-32 sm:w-32 md:w-36 justify-center flex items-center bg-indigo-600 text-white hover:bg-indigo-800 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                            เพิ่มโปรไฟล์
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {freelanceprofile.map((freelancer) => (
                            <FreelancerCard
                              key={freelancer._id}
                              freelancer={freelancer}
                              isOwner={true}
                              onEdit={() => {
                                setEditData(freelancer) // เก็บข้อมูลที่จะแก้
                                setIsPostModalOpen(true) // เปิด Modal
                              }}
                              onRefresh={fetchJobs}
                            />
                          ))}
                        </div>
                      </>
                    ))}
                  {activeTab === "hiredJobs" &&
                    (hiredJobs.length === 0 ? (
                      <EmptyState text="คุณยังไม่มีงานที่จ้างไว้" />
                    ) : (
                      <div>
                        <p className="text-sm sm:text-lg flex gap-2 my-2">งานที่ฉันจ้าง</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hiredJobs.map((job) => (
                              <JobCard key={job._id} job={job} />
                            ))}
                          </div>
                      </div>
                    ))}
                  {activeTab === "workingJobs" &&
                    (workingJobs.length === 0 ? (
                      <EmptyState text="คุณยังไม่มีงานที่รับทำ" />
                    ) : (
                      <div>
                        <p className="text-sm sm:text-lg flex gap-2 my-2">งานที่ฉันรับทำ</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {workingJobs.map((job) => (
                              <JobCard key={job._id} job={job} />
                            ))}
                          </div>
                      </div>
                    ))}
                  {activeTab === "review" &&
                    (reviews.length === 0 ? (
                      <EmptyState text="คุณยังไม่มีรีวิว" />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </SectionCard>

            {isPostModalOpen && (
              <FreelancerProfileModal
                onClose={() => {
                  setIsPostModalOpen(false)
                  setEditData(null) 
                }}
                onSuccess={() => {
                  fetchJobs()
                }}
                initialData={editData} // ส่งข้อมูลไป (ถ้ามีคือ Edit)
                isEdit={!!editData} // แปลงเป็น Boolean
              />
            )}

            {/* <SectionCard className="h-[300px] bg-transparent" overflow={true} title={"รีวิวจากผู้ว่าจ้าง"}>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            </SectionCard> */}
          </div>
        </div>
      </main>
    </div>
  )
}

const Star = ({ size, className }) => (
  <svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const EmptyState = ({ text }) => (
  <div className="text-center py-12 text-slate-500">
    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
    <p className="font-medium">{text}</p>
  </div>
)

export default Profile
