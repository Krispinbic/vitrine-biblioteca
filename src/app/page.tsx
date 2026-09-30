'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  UserCheck, 
  LogIn, 
  LogOut, 
  X, 
  User, 
  Lock, 
  Mail, 
  IdCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Store, 
  Sparkles,
  Calendar
} from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  status: 'Disponível' | 'Alugado';
  loanDate: string;
  borrower: string;
  cover: string;
}

interface UserAccount {
  name: string;
  id: string;
  email: string;
  password: string;
}

const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: "Dom Casmurro",
    author: "Machado de Assis",
    description: "Clássico da literatura brasileira que aborda a célebre dúvida sobre a fidelidade de Capitu através da narrativa de Bento Santiago.",
    status: "Disponível",
    loanDate: "",
    borrower: "",
    cover: "https://placehold.co/400x550/e0f2fe/0284c7?text=Dom+Casmurro"
  },
  {
    id: 2,
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    description: "Uma poética história sobre um pequeno príncipe que viaja pelos planetas, descobrindo profundas lições sobre amizade, amor e o sentido da vida.",
    status: "Alugado",
    loanDate: "10/09/2026",
    borrower: "Bárbara Rafaely (Biblioteca física)",
    cover: "https://placehold.co/400x550/e0f2fe/0284c7?text=O+Pequeno+Principe"
  },
  {
    id: 3,
    title: "A Revolução dos Bichos",
    author: "George Orwell",
    description: "Satírica fábula política sobre animais de uma granja que expulsam os humanos e instauram um regime próprio que degenera em tirania.",
    status: "Disponível",
    loanDate: "",
    borrower: "",
    cover: "https://placehold.co/400x550/e0f2fe/0284c7?text=Revolucao+dos+Bichos"
  }
];

const INITIAL_USERS: UserAccount[] = [
  {
    name: "Paulo Neto",
    id: "454545",
    email: "paulo123@hotmail.com",
    password: "Password123!"
  },
  {
    name: "Bárbara Rafaely",
    id: "535353",
    email: "barbara123@hotmail.com",
    password: "Password123!"
  }
];

export default function App() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form states
  const [formId, setFormId] = useState<string>("");
  const [formPassword, setFormPassword] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('biblioteca_escolar_books');
      const savedUsers = localStorage.getItem('biblioteca_escolar_users');
      const savedUser = localStorage.getItem('biblioteca_escolar_current_user');

      if (savedBooks) setBooks(JSON.parse(savedBooks));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {
      console.error("Erro ao carregar dados do LocalStorage", e);
    }
  }, []);

  const saveBooksToStorage = (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    try {
      localStorage.setItem('biblioteca_escolar_books', JSON.stringify(updatedBooks));
    } catch (e) {
      console.error(e);
    }
  };

  const saveUsersToStorage = (updatedUsers: UserAccount[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem('biblioteca_escolar_users', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleLoan = (bookId: number) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const updated = books.map(book => {
      if (book.id === bookId) {
        if (book.status === 'Disponível') {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          showToast(`Empréstimo registrado para ${currentUser.name}!`, 'success');
          return {
            ...book,
            status: 'Alugado' as const,
            loanDate: `${day}/${month}/${year}`,
            borrower: `${currentUser.name} (ID: ${currentUser.id})`
          };
        } else {
          showToast('Livro devolvido à estante com sucesso!', 'success');
          return {
            ...book,
            status: 'Disponível' as const,
            loanDate: '',
            borrower: ''
          };
        }
      }
      return book;
    });

    saveBooksToStorage(updated);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // 1. ID: only numbers without special characters
    const idRegex = /^\d+$/;
    if (!idRegex.test(formId)) {
      setFormError("O ID deve conter apenas números, sem caracteres especiais ou letras.");
      return;
    }

    // 4. Password: min 8 chars, letters, numbers and special characters
    const passLength = formPassword.length >= 8;
    const passLetter = /[a-zA-Z]/.test(formPassword);
    const passNumber = /\d/.test(formPassword);
    const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(formPassword);

    if (!passLength || !passLetter || !passNumber || !passSpecial) {
      setFormError("A senha deve ter no mínimo 8 caracteres, contendo letras, números e símbolos especiais.");
      return;
    }

    if (authMode === 'register') {
      // 2. Name: letters and spaces only, NO numbers
      const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
      if (!nameRegex.test(formName.trim())) {
        setFormError("O nome deve conter apenas letras e espaços (sem números).");
        return;
      }

      // 3. Email: letters, numbers and '@'
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formEmail) || !/\d/.test(formEmail)) {
        setFormError("O e-mail deve conter letras, números e o caractere '@' (ex: barbara123@hotmail.com).");
        return;
      }

      if (users.some(u => u.id === formId)) {
        setFormError("Este ID já está cadastrado no sistema.");
        return;
      }

      const newUser: UserAccount = {
        name: formName.trim(),
        id: formId,
        email: formEmail.trim(),
        password: formPassword
      };

      const updatedUsers = [...users, newUser];
      saveUsersToStorage(updatedUsers);
      setCurrentUser(newUser);
      try {
        localStorage.setItem('biblioteca_escolar_current_user', JSON.stringify(newUser));
      } catch (e) {
        console.error(e);
      }

      setIsAuthOpen(false);
      showToast(`Bem-vindo(a), ${newUser.name}! Conta criada com sucesso.`);
      clearForm();

    } else {
      // Login check
      const foundUser = users.find(u => u.id === formId);
      if (!foundUser) {
        setFormError("Usuário não encontrado com este ID.");
        return;
      }

      if (foundUser.password !== formPassword) {
        setFormError("Senha incorreta. Verifique os dados informados.");
        return;
      }

      setCurrentUser(foundUser);
      try {
        localStorage.setItem('biblioteca_escolar_current_user', JSON.stringify(foundUser));
      } catch (e) {
        console.error(e);
      }
      setIsAuthOpen(false);
      showToast(`Sessão iniciada como ${foundUser.name}.`);
      clearForm();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('biblioteca_escolar_current_user');
    } catch (e) {
      console.error(e);
    }
    showToast("Sessão encerrada com sucesso.", "info");
  };

  const clearForm = () => {
    setFormId("");
    setFormPassword("");
    setFormName("");
    setFormEmail("");
    setFormError("");
  };

  const fillDemo = (userType: 'Paulo' | 'Barbara') => {
    if (userType === 'Paulo') {
      setFormId("454545");
      setFormPassword("Password123!");
      if (authMode === 'register') {
        setFormName("Paulo Neto");
        setFormEmail("paulo123@hotmail.com");
      }
    } else {
      setFormId("535353");
      setFormPassword("Password123!");
      if (authMode === 'register') {
        setFormName("Bárbara Rafaely");
        setFormEmail("barbara123@hotmail.com");
      }
    }
    setFormError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans selection:bg-sky-200">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl font-bold shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Biblioteca Escolar</h1>
              <p className="text-xs text-slate-500">Gestão e consulta de acervo físico</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-sky-50 text-sky-700 px-3.5 py-2 rounded-2xl border border-sky-100 text-sm font-medium">
                  <UserCheck className="w-4 h-4 text-sky-500" />
                  <span>{currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 p-2.5 rounded-2xl hover:bg-slate-100 transition"
                  title="Sair da conta"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition shadow-sm flex items-center space-x-2 shadow-sky-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        
        {/* Hero & Search Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 text-sky-400 opacity-25 pointer-events-none">
            <BookOpen className="w-96 h-96" />
          </div>
          <div className="max-w-2xl relative z-10">
            <span className="bg-sky-400/30 text-sky-100 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-flex items-center gap-1.5 border border-sky-400/40">
              <Sparkles className="w-3.5 h-3.5" /> Acervo Escolar Digital & Físico
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Explore nosso acervo de livros</h2>
            <p className="text-sky-100 text-sm sm:text-base mb-8 leading-relaxed">
              Consulte a disponibilidade dos livros em tempo real na biblioteca física da escola e verifique empréstimos.
            </p>
            
            {/* Search Input */}
            <div className="relative max-w-xl">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busque por título ou autor (ex: Dom Casmurro, Machado...)" 
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-800 placeholder-slate-400 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm font-medium transition"
              />
            </div>
          </div>
        </div>

        {/* Catalog Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Livros</h3>
            <p className="text-xs text-slate-500 mt-1">Exibindo itens disponíveis e alugados no acervo</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
          </span>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => {
            const isAvailable = book.status === 'Disponível';
            return (
              <div 
                key={book.id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group"
              >
                <div>
                  {/* Book Cover Container */}
                  <div className="h-64 bg-sky-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
                    <img 
                      src={book.cover} 
                      alt={`Capa de ${book.title}`} 
                      className="h-full object-cover rounded-2xl shadow-md group-hover:scale-105 transition duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x550/e0f2fe/0284c7?text=Livro"; }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 ${isAvailable ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                        {isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {book.status}
                      </span>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="p-6">
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">{book.author}</span>
                    <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2 leading-snug">{book.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed mb-6 line-clamp-3">{book.description}</p>
                    
                    {/* Status Box */}
                    {!isAvailable ? (
                      <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                        <div className="flex items-center space-x-2 font-medium">
                          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Data do empréstimo: <strong>{book.loanDate}</strong></span>
                        </div>
                        <div className="flex items-center space-x-2 font-medium">
                          <Store className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Retirado por / Alugado na biblioteca física: <strong>{book.borrower}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-center space-x-2.5">
                        <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">Disponível na estante da biblioteca física.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-[11px] text-slate-400 font-medium">Acervo #0{book.id}</span>
                  <button 
                    onClick={() => handleToggleLoan(book.id)}
                    className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs ${isAvailable ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {isAvailable ? 'Registrar Empréstimo' : 'Devolver à Estante'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs mt-6">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-1">Nenhum livro encontrado</h4>
            <p className="text-sm text-slate-500">Tente buscar por outro termo ou autor no acervo.</p>
          </div>
        )}

      </main>

      {/* Authentication Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 relative transform transition-all">
            <button 
              onClick={() => setIsAuthOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-xl transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IdCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {authMode === 'login' ? 'Acesso à Biblioteca' : 'Cadastro de Novo Usuário'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'login' ? 'Insira seu ID e senha cadastrados' : 'Preencha os campos seguindo as regras de segurança'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button 
                type="button" 
                onClick={() => { setAuthMode('login'); clearForm(); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${authMode === 'login' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Entrar
              </button>
              <button 
                type="button" 
                onClick={() => { setAuthMode('register'); clearForm(); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${authMode === 'register' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Cadastrar
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Name Field (Register only) */}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Paulo Neto ou Bárbara Rafaely" 
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Apenas letras e espaços (sem números).</p>
                </div>
              )}

              {/* ID Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">ID de Usuário</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="Ex: 454545 ou 535353" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Apenas números sem caracteres especiais.</p>
              </div>

              {/* Email Field (Register only) */}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail Institucional</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="exemplo123@hotmail.com" 
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Deve conter letras, números e '@'.</p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type="password" 
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Mín. 8 caracteres, com letras, números e símbolos.</p>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-2xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-2xl font-semibold text-sm transition shadow-md shadow-sky-600/20 mt-2"
              >
                {authMode === 'login' ? 'Entrar na Biblioteca' : 'Cadastrar Conta'}
              </button>
            </form>

            {/* Quick Demo Helper Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 mb-2">Testar contas cadastradas:</p>
              <div className="flex justify-center gap-2">
                <button 
                  type="button" 
                  onClick={() => fillDemo('Paulo')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                >
                  Paulo (ID: 454545)
                </button>
                <button 
                  type="button" 
                  onClick={() => fillDemo('Barbara')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                >
                  Bárbara (ID: 535353)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-16">
        <p>&copy; 2026 Biblioteca Escolar. Desenvolvido para gerenciamento e consulta de acervo físico.</p>
      </footer>

    </div>
  );
}