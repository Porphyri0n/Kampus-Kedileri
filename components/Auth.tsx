import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { Cat, KeyRound, Mail, User as UserIcon, GraduationCap, School, BookOpen } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [roleType, setRoleType] = useState<'STUDENT' | 'ACADEMIC'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [department, setDepartment] = useState('');
  
  // Student Specific
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState('Hazırlık');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await ApiService.login(loginEmail, loginPassword);
    } catch (err: any) {
       console.error(err);
       if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError('Giriş bilgileri hatalı.');
       } else {
          setError('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
       }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await ApiService.register({
        roleType,
        fullName,
        personalEmail,
        password,
        schoolEmail,
        department,
        studentId,
        grade
      });
      setVerificationSent(true);
      setIsLogin(true); // Switch to login screen but show verification msg
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
         setError('Bu e-posta zaten kullanımda.');
      } else if (err.code === 'auth/weak-password') {
         setError('Şifre en az 6 karakter olmalı.');
      } else {
         setError('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Doğrulama E-postası Gönderildi</h2>
                <p className="text-slate-600 mb-6">
                    Lütfen <strong>{personalEmail}</strong> adresine gönderilen bağlantıya tıklayarak hesabınızı doğrulayın. Hesabınız onaylandıktan sonra giriş yapabilirsiniz.
                </p>
                <button 
                    onClick={() => setVerificationSent(false)} 
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
                >
                    Giriş Ekranına Dön
                </button>
             </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="bg-amber-500 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
             <Cat className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">THKÜ Kampüs Kedileri</h1>
          <p className="text-amber-100">Kampüsümüzdeki dostlarımız için tek yürek.</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
            </div>
          )}

          {isLogin ? (
              // LOGIN FORM
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">E-posta Adresi</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="ornek@thk.edu.tr"
                    />
                </div>
                </div>

                <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Şifre</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="••••••••"
                    />
                </div>
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center"
                >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Giriş Yap'
                )}
                </button>
              </form>
          ) : (
              // REGISTER FORM
              <form onSubmit={handleRegister} className="space-y-4">
                  {/* Role Selection */}
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                      <button 
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${roleType === 'STUDENT' ? 'bg-white shadow text-amber-600' : 'text-slate-500'}`}
                        onClick={() => setRoleType('STUDENT')}
                      >
                          Öğrenci
                      </button>
                      <button 
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${roleType === 'ACADEMIC' ? 'bg-white shadow text-amber-600' : 'text-slate-500'}`}
                        onClick={() => setRoleType('ACADEMIC')}
                      >
                          Akademisyen
                      </button>
                  </div>

                  {/* Common Fields */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Genel Bilgiler</label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                placeholder="İsim Soyisim"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={personalEmail}
                                onChange={(e) => setPersonalEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                placeholder="Kişisel Mail (Giriş için)"
                            />
                        </div>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                placeholder="Şifre"
                            />
                        </div>
                    </div>
                  </div>

                  {/* Role Specific Fields */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Okul Bilgileri</label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                        {roleType === 'STUDENT' && (
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs border border-slate-300 px-1 rounded">ID</span>
                                <input
                                    type="text"
                                    required
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    placeholder="Okul Numarası"
                                />
                            </div>
                        )}
                        
                        <div className="relative">
                            <School className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                placeholder={roleType === 'STUDENT' ? "Okuduğu Bölüm" : "Bulunduğu Bölüm"}
                            />
                        </div>

                        {roleType === 'STUDENT' && (
                             <div className="relative">
                                <GraduationCap className="absolute left-3 top-3 text-slate-400" size={18} />
                                <select 
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="Hazırlık">Hazırlık</option>
                                    <option value="1. Sınıf">1. Sınıf</option>
                                    <option value="2. Sınıf">2. Sınıf</option>
                                    <option value="3. Sınıf">3. Sınıf</option>
                                    <option value="4. Sınıf">4. Sınıf</option>
                                </select>
                            </div>
                        )}

                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={schoolEmail}
                                onChange={(e) => setSchoolEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                placeholder="Okul Maili"
                            />
                        </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center mt-4"
                    >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Kayıt Ol ve Doğrula'
                    )}
                </button>
              </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              {isLogin ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
            </button>
            {isLogin && (
               <div className="mt-2">
                 <a href="#" className="text-xs text-slate-400 hover:text-slate-600">Şifremi Unuttum</a>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};