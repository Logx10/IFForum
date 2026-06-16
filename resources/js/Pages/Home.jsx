import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import Navbar from "../Components/Navbar";
import { useLike } from "../hooks/useLike";
import { apiFetch } from "../hooks/useApi";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 40 }) {
    const initials =
        name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "??";
    const colors = [
        "#3b5998",
        "#8b5cf6",
        "#059669",
        "#dc2626",
        "#d97706",
        "#0ea5e9",
        "#ec4899",
    ];
    const color = colors[name?.charCodeAt(0) % colors.length] || "#3b5998";
    if (avatar)
        return (
            <img
                src={avatar}
                alt={name}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                }}
            />
        );
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: size * 0.35,
                fontFamily: "Georgia, serif",
            }}
        >
            {initials}
        </div>
    );
}

// ── Modal de confirmação ──────────────────────────────────────────────────────
function ConfirmDeleteModal({ message, onConfirm, onCancel, loading }) {
    return (
        <>
            <div
                onClick={onCancel}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(3px)",
                    zIndex: 400,
                }}
            />
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    background: "#fff",
                    borderRadius: 12,
                    padding: 28,
                    zIndex: 401,
                    width: "100%",
                    maxWidth: 400,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                    textAlign: "center",
                }}
            >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
                <h3
                    style={{
                        margin: "0 0 8px",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1c1e21",
                        fontFamily: "Georgia, serif",
                    }}
                >
                    Confirmar exclusão
                </h3>
                <p
                    style={{
                        margin: "0 0 24px",
                        fontSize: 14,
                        color: "#65676b",
                        lineHeight: 1.5,
                    }}
                >
                    {message}
                </p>
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                    }}
                >
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "10px 24px",
                            borderRadius: 8,
                            border: "1.5px solid #dddfe2",
                            background: "#fff",
                            color: "#1c1e21",
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            padding: "10px 24px",
                            borderRadius: 8,
                            border: "none",
                            background: loading ? "#f87171" : "#dc2626",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Excluindo..." : "Sim, excluir"}
                    </button>
                </div>
            </div>
        </>
    );
}

// ── Menu ··· de ações ─────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete, isOpen, setIsOpen }) {
    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((o) => !o);
                }}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#65676b",
                    fontSize: 18,
                    padding: "2px 8px",
                    borderRadius: 6,
                    lineHeight: 1,
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f2f5")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                }
                title="Opções"
            >
                ···
            </button>
            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 50 }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            marginTop: 4,
                            background: "#fff",
                            borderRadius: 8,
                            border: "1px solid #dddfe2",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                            zIndex: 51,
                            minWidth: 140,
                            overflow: "hidden",
                        }}
                    >
                        <button
                            onClick={() => {
                                onEdit();
                                setIsOpen(false);
                            }}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                border: "none",
                                background: "none",
                                padding: "10px 16px",
                                cursor: "pointer",
                                fontSize: 14,
                                color: "#1c1e21",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f0f2f5")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                            }
                        >
                            ✏️ Editar
                        </button>
                        <button
                            onClick={() => {
                                onDelete();
                                setIsOpen(false);
                            }}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                border: "none",
                                background: "none",
                                padding: "10px 16px",
                                cursor: "pointer",
                                fontSize: 14,
                                color: "#dc2626",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#fff5f5")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                            }
                        >
                            🗑️ Excluir
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Modal editar post ─────────────────────────────────────────────────────────
function EditPostModal({ post, onClose, onSaved }) {
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    async function handleSave(e) {
        e.preventDefault();
        const errs = {};
        if (!title.trim() || title.length < 5)
            errs.title = "Mínimo 5 caracteres";
        if (!body.trim() || body.length < 20)
            errs.body = "Mínimo 20 caracteres";
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        try {
            const data = await apiFetch(`/posts/${post.id}`, "PUT", {
                title,
                body,
            });
            onSaved(data);
            onClose();
        } catch (err) {
            setErrors({ general: err.message || "Erro ao salvar" });
            setLoading(false);
        }
    }

    const inp = (err) => ({
        width: "100%",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 14,
        boxSizing: "border-box",
        border: `1.5px solid ${err ? "#dc2626" : "#dddfe2"}`,
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color .15s",
    });

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                    zIndex: 300,
                }}
            />
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "100%",
                    maxWidth: 620,
                    maxHeight: "90vh",
                    background: "#fff",
                    borderRadius: 12,
                    zIndex: 301,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        padding: "18px 20px",
                        borderBottom: "1px solid #dddfe2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#1c1e21",
                            fontFamily: "Georgia, serif",
                        }}
                    >
                        ✏️ Editar post
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#f0f2f5",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            cursor: "pointer",
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#65676b",
                        }}
                    >
                        ×
                    </button>
                </div>
                <form
                    onSubmit={handleSave}
                    style={{ padding: 20, overflowY: "auto", flex: 1 }}
                >
                    {errors.general && (
                        <div
                            style={{
                                background: "#fee2e2",
                                borderRadius: 8,
                                padding: "10px 14px",
                                marginBottom: 16,
                                fontSize: 13,
                                color: "#dc2626",
                            }}
                        >
                            {errors.general}
                        </div>
                    )}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1c1e21",
                                marginBottom: 6,
                            }}
                        >
                            Título *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inp(errors.title)}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#3b5998")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = errors.title
                                    ? "#dc2626"
                                    : "#dddfe2")
                            }
                        />
                        {errors.title && (
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "#dc2626",
                                    margin: "4px 0 0",
                                }}
                            >
                                {errors.title}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1c1e21",
                                marginBottom: 6,
                            }}
                        >
                            Conteúdo *
                        </label>
                        <textarea
                            value={body}
                            rows={10}
                            onChange={(e) => setBody(e.target.value)}
                            style={{
                                ...inp(errors.body),
                                resize: "vertical",
                                lineHeight: 1.6,
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#3b5998")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = errors.body
                                    ? "#dc2626"
                                    : "#dddfe2")
                            }
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 4,
                            }}
                        >
                            {errors.body ? (
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#dc2626",
                                        margin: 0,
                                    }}
                                >
                                    {errors.body}
                                </p>
                            ) : (
                                <span />
                            )}
                            <span
                                style={{
                                    fontSize: 12,
                                    color:
                                        body.length < 20
                                            ? "#dc2626"
                                            : "#65676b",
                                }}
                            >
                                {body.length} chars
                            </span>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "1.5px solid #dddfe2",
                                background: "#fff",
                                color: "#1c1e21",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "10px 24px",
                                borderRadius: 8,
                                border: "none",
                                background: loading ? "#93acd8" : "#3b5998",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? "Salvando..." : "💾 Salvar alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ── Modal criar novo post ─────────────────────────────────────────────────────
function NewPostModal({ categories, onClose }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        const errs = {};
        if (!title.trim() || title.length < 5)
            errs.title = "Mínimo 5 caracteres";
        if (!body.trim() || body.length < 20)
            errs.body = "Mínimo 20 caracteres";
        if (!categoryId) errs.category = "Selecione uma categoria";
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        router.post(
            "/posts",
            {
                title,
                body,
                category_id: categoryId,
                tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            },
            {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (e) => {
                    setErrors(e);
                    setLoading(false);
                },
            },
        );
    }

    const inp = (err) => ({
        width: "100%",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 14,
        boxSizing: "border-box",
        border: `1.5px solid ${err ? "#dc2626" : "#dddfe2"}`,
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color .15s",
    });

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                    zIndex: 300,
                    animation: "fadeIn .15s ease",
                }}
            />
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "100%",
                    maxWidth: 600,
                    maxHeight: "90vh",
                    background: "#fff",
                    borderRadius: 12,
                    zIndex: 301,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    animation: "slideUp .2s ease",
                }}
            >
                <div
                    style={{
                        padding: "18px 20px",
                        borderBottom: "1px solid #dddfe2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#1c1e21",
                            fontFamily: "Georgia, serif",
                        }}
                    >
                        ✏️ Criar novo post
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#f0f2f5",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            cursor: "pointer",
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#65676b",
                        }}
                    >
                        ×
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    style={{ padding: 20, overflowY: "auto", flex: 1 }}
                >
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1c1e21",
                                marginBottom: 6,
                            }}
                        >
                            Título *
                        </label>
                        <input
                            type="text"
                            value={title}
                            placeholder="Sobre o que você quer falar?"
                            onChange={(e) => setTitle(e.target.value)}
                            style={inp(errors.title)}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#3b5998")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = errors.title
                                    ? "#dc2626"
                                    : "#dddfe2")
                            }
                        />
                        {errors.title && (
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "#dc2626",
                                    margin: "4px 0 0",
                                }}
                            >
                                {errors.title}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1c1e21",
                                marginBottom: 6,
                            }}
                        >
                            Categoria *
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            style={{
                                ...inp(errors.category),
                                background: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">Selecione uma categoria...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "#dc2626",
                                    margin: "4px 0 0",
                                }}
                            >
                                {errors.category}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1c1e21",
                                marginBottom: 6,
                            }}
                        >
                            Conteúdo *
                        </label>
                        <textarea
                            value={body}
                            rows={6}
                            placeholder="Escreva o conteúdo..."
                            onChange={(e) => setBody(e.target.value)}
                            style={{
                                ...inp(errors.body),
                                resize: "vertical",
                                lineHeight: 1.6,
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#3b5998")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = errors.body
                                    ? "#dc2626"
                                    : "#dddfe2")
                            }
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 4,
                            }}
                        >
                            {errors.body ? (
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#dc2626",
                                        margin: 0,
                                    }}
                                >
                                    {errors.body}
                                </p>
                            ) : (
                                <span />
                            )}
                            <span
                                style={{
                                    fontSize: 12,
                                    color:
                                        body.length < 20
                                            ? "#dc2626"
                                            : "#65676b",
                                }}
                            >
                                {body.length} / mín. 20
                            </span>
                        </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1c1e21",
                                marginBottom: 6,
                            }}
                        >
                            Tags{" "}
                            <span style={{ fontWeight: 400, color: "#65676b" }}>
                                (opcional — separe por vírgula)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={tags}
                            placeholder="ex: laravel, php, dúvida"
                            onChange={(e) => setTags(e.target.value)}
                            style={inp(false)}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#3b5998")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = "#dddfe2")
                            }
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "1.5px solid #dddfe2",
                                background: "#fff",
                                color: "#1c1e21",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "10px 24px",
                                borderRadius: 8,
                                border: "none",
                                background: loading ? "#93acd8" : "#3b5998",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? "Publicando..." : "📢 Publicar"}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
        </>
    );
}

// ── PostCard com editar/deletar ───────────────────────────────────────────────
function PostCard({ post: initialPost, onOpenPost, onDeleted }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [post, setPost] = useState(initialPost);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [confirmDel, setConfirmDel] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const {
        liked,
        likesCount,
        toggle: handleLike,
    } = useLike("post", post.id, post.is_liked || false, post.likes_count || 0);

    const canEdit =
        user &&
        (user.id === post.author?.id ||
            user.role === "admin" ||
            user.role === "moderator");

    async function handleDelete() {
        setDelLoading(true);
        try {
            await apiFetch(`/posts/${post.id}`, "DELETE");
            onDeleted?.(post.id);
        } catch (err) {
            setDelLoading(false);
            setConfirmDel(false);
            alert("Erro ao excluir: " + err.message);
        }
    }

    const preview = post.body?.replace(/\n/g, " ").slice(0, 220);
    const hasMore = post.body?.length > 220;

    return (
        <>
            <div
                style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #dddfe2",
                    marginBottom: 16,
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    transition: "box-shadow .2s",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.13)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                        "0 1px 2px rgba(0,0,0,0.08)")
                }
            >
                {/* Header */}
                <div
                    style={{
                        padding: "14px 16px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <Avatar
                        name={post.author?.name}
                        avatar={post.author?.avatar}
                        size={42}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#1c1e21",
                                    fontFamily: "Georgia, serif",
                                }}
                            >
                                {post.author?.name}
                            </span>
                            {post.is_pinned && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        background: "#fff3cd",
                                        color: "#856404",
                                        borderRadius: 4,
                                        padding: "1px 6px",
                                        fontWeight: 600,
                                    }}
                                >
                                    📌 Fixado
                                </span>
                            )}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 2,
                            }}
                        >
                            <span style={{ fontSize: 12, color: "#65676b" }}>
                                {post.last_activity_at}
                            </span>
                            <span style={{ color: "#bcc0c4", fontSize: 10 }}>
                                •
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "1px 8px",
                                    borderRadius: 20,
                                    color: "#fff",
                                    background:
                                        post.category?.color || "#3b5998",
                                }}
                            >
                                {post.category?.icon} {post.category?.name}
                            </span>
                        </div>
                    </div>
                    {/* Menu ··· só para autor/moderador */}
                    {canEdit && (
                        <ActionMenu
                            isOpen={menuOpen}
                            setIsOpen={setMenuOpen}
                            onEdit={() => setShowEdit(true)}
                            onDelete={() => setConfirmDel(true)}
                        />
                    )}
                </div>

                {/* Título */}
                <div
                    style={{ padding: "10px 16px 4px", cursor: "pointer" }}
                    onClick={() => onOpenPost(post.slug)}
                >
                    <h2
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1c1e21",
                            fontFamily: "Georgia, serif",
                            lineHeight: 1.4,
                            margin: 0,
                        }}
                        onMouseEnter={(e) => (e.target.style.color = "#3b5998")}
                        onMouseLeave={(e) => (e.target.style.color = "#1c1e21")}
                    >
                        {post.title}
                    </h2>
                </div>

                {/* Body */}
                <div style={{ padding: "4px 16px 10px" }}>
                    <p
                        style={{
                            fontSize: 14,
                            color: "#3e4047",
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        {preview}
                        {hasMore && (
                            <span style={{ color: "#65676b" }}>
                                ...{" "}
                                <span
                                    onClick={() => onOpenPost(post.slug)}
                                    style={{
                                        color: "#3b5998",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    ver mais
                                </span>
                            </span>
                        )}
                    </p>
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div
                        style={{
                            padding: "0 16px 10px",
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                        }}
                    >
                        {post.tags.map((tag) => (
                            <span
                                key={tag.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get(
                                        "/",
                                        { tag: tag.slug },
                                        { preserveScroll: false },
                                    );
                                }}
                                style={{
                                    fontSize: 12,
                                    color: "#3b5998",
                                    background: "#e7f0fd",
                                    borderRadius: 20,
                                    padding: "2px 10px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    transition: "background .15s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.target.style.background = "#c7d9f7")
                                }
                                onMouseLeave={(e) =>
                                    (e.target.style.background = "#e7f0fd")
                                }
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Contadores */}
                <div
                    style={{
                        padding: "6px 16px",
                        borderTop: "1px solid #f0f2f5",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            color: "#65676b",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        {likesCount > 0 && (
                            <>
                                <span>👍</span> {likesCount}
                            </>
                        )}
                    </span>
                    <span style={{ fontSize: 13, color: "#65676b" }}>
                        {post.comments_count > 0 &&
                            `${post.comments_count} comentário${post.comments_count > 1 ? "s" : ""}`}
                        {post.views_count > 0 && ` • ${post.views_count} views`}
                    </span>
                </div>

                {/* Botões */}
                <div
                    style={{ display: "flex", borderTop: "1px solid #dddfe2" }}
                >
                    {[
                        {
                            icon: "👍",
                            label: liked ? "Curtido" : "Curtir",
                            action: handleLike,
                            active: liked,
                        },
                        {
                            icon: "💬",
                            label: "Comentar",
                            action: () => onOpenPost(post.slug),
                        },
                        { icon: "↗️", label: "Compartilhar", action: () => {} },
                    ].map((btn) => (
                        <button
                            key={btn.label}
                            onClick={btn.action}
                            style={{
                                flex: 1,
                                border: "none",
                                background: "none",
                                padding: "10px 0",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                color: btn.active ? "#3b5998" : "#65676b",
                                transition: "background .15s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f0f2f5")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                            }
                        >
                            <span style={{ fontSize: 16 }}>{btn.icon}</span>
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal editar */}
            {showEdit && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEdit(false)}
                    onSaved={(data) =>
                        setPost((p) => ({
                            ...p,
                            title: data.title,
                            body: data.body,
                        }))
                    }
                />
            )}

            {/* Modal confirmar deleção */}
            {confirmDel && (
                <ConfirmDeleteModal
                    message="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDel(false)}
                    loading={delLoading}
                />
            )}
        </>
    );
}

// ── CategoryStories ───────────────────────────────────────────────────────────
function CategoryStories({ categories, activeCategory, onCategory }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #dddfe2",
                padding: "12px 0",
                marginBottom: 16,
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    padding: "0 16px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                }}
            >
                <button
                    onClick={() => onCategory(null)}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        flexShrink: 0,
                        padding: 0,
                    }}
                >
                    <div
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: !activeCategory
                                ? "linear-gradient(135deg,#3b5998,#8b5cf6)"
                                : "#f0f2f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 26,
                            border: !activeCategory
                                ? "3px solid #3b5998"
                                : "3px solid transparent",
                            boxSizing: "border-box",
                        }}
                    >
                        🏠
                    </div>
                    <span
                        style={{
                            fontSize: 11,
                            color: !activeCategory ? "#3b5998" : "#65676b",
                            fontWeight: !activeCategory ? 700 : 400,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Todos
                    </span>
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onCategory(cat.slug)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                            padding: 0,
                        }}
                    >
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                background:
                                    activeCategory === cat.slug
                                        ? cat.color || "#3b5998"
                                        : "#f0f2f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 26,
                                border:
                                    activeCategory === cat.slug
                                        ? `3px solid ${cat.color || "#3b5998"}`
                                        : "3px solid #e4e6ea",
                                boxSizing: "border-box",
                            }}
                        >
                            {cat.icon || "📁"}
                        </div>
                        <span
                            style={{
                                fontSize: 11,
                                color:
                                    activeCategory === cat.slug
                                        ? cat.color || "#3b5998"
                                        : "#65676b",
                                fontWeight:
                                    activeCategory === cat.slug ? 700 : 400,
                                whiteSpace: "nowrap",
                                maxWidth: 64,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ categories, activeCategory, onCategory, onNewPost }) {
    const { auth } = usePage().props;
    return (
        <div style={{ width: 280, flexShrink: 0 }}>
            <div
                style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #dddfe2",
                    overflow: "hidden",
                    marginBottom: 16,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
            >
                <div
                    style={{
                        background:
                            "linear-gradient(135deg,#3b5998 0%,#8b5cf6 100%)",
                        padding: "24px 16px 16px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: 36, marginBottom: 6 }}>🗣️</div>
                    <div
                        style={{
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 18,
                            fontFamily: "Georgia, serif",
                        }}
                    >
                        IFForum
                    </div>
                    <div
                        style={{
                            color: "rgba(255,255,255,.8)",
                            fontSize: 12,
                            marginTop: 4,
                        }}
                    >
                        Comunidade IFCE Campus Tianguá
                    </div>
                </div>
                <div style={{ padding: 16 }}>
                    <p
                        style={{
                            fontSize: 13,
                            color: "#606770",
                            lineHeight: 1.5,
                            margin: "0 0 12px",
                        }}
                    >
                        Espaço de discussão dos estudantes do IFCE.
                    </p>
                    {auth?.user ? (
                        <button
                            onClick={onNewPost}
                            style={{
                                width: "100%",
                                background: "#3b5998",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "9px 0",
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                                (e.target.style.background = "#2d4373")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.background = "#3b5998")
                            }
                        >
                            + Novo Post
                        </button>
                    ) : (
                        <button
                            onClick={() => router.visit("/login")}
                            style={{
                                width: "100%",
                                background: "#3b5998",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "9px 0",
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                        >
                            Entre para postar
                        </button>
                    )}
                </div>
            </div>
            <div
                style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #dddfe2",
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
            >
                <div
                    style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f0f2f5",
                    }}
                >
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#1c1e21",
                            fontFamily: "Georgia, serif",
                        }}
                    >
                        Categorias
                    </span>
                </div>
                <div style={{ padding: "8px 0" }}>
                    <button
                        onClick={() => onCategory(null)}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            border: "none",
                            background: !activeCategory ? "#e7f0fd" : "none",
                            padding: "8px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontSize: 14,
                            color: !activeCategory ? "#3b5998" : "#1c1e21",
                            fontWeight: !activeCategory ? 700 : 400,
                        }}
                    >
                        <span style={{ fontSize: 18 }}>🏠</span>
                        <span style={{ flex: 1 }}>Todos os posts</span>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategory(cat.slug)}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                border: "none",
                                background:
                                    activeCategory === cat.slug
                                        ? "#e7f0fd"
                                        : "none",
                                padding: "8px 16px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                fontSize: 14,
                                color:
                                    activeCategory === cat.slug
                                        ? "#3b5998"
                                        : "#1c1e21",
                                fontWeight:
                                    activeCategory === cat.slug ? 700 : 400,
                                transition: "background .15s",
                            }}
                            onMouseEnter={(e) => {
                                if (activeCategory !== cat.slug)
                                    e.currentTarget.style.background =
                                        "#f0f2f5";
                            }}
                            onMouseLeave={(e) => {
                                if (activeCategory !== cat.slug)
                                    e.currentTarget.style.background = "none";
                            }}
                        >
                            <span style={{ fontSize: 18 }}>
                                {cat.icon || "📁"}
                            </span>
                            <span style={{ flex: 1 }}>{cat.name}</span>
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#65676b",
                                    background: "#f0f2f5",
                                    borderRadius: 20,
                                    padding: "1px 7px",
                                }}
                            >
                                {cat.posts_count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Paginação ─────────────────────────────────────────────────────────────────
function Pagination({ links }) {
    if (!links?.links) return null;
    const pages = links.links.filter(
        (l) => l.label !== "&laquo; Previous" && l.label !== "Next &raquo;",
    );
    if (pages.length <= 1) return null;
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 8,
            }}
        >
            {links.prev && (
                <button
                    onClick={() => router.visit(links.prev)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #dddfe2",
                        background: "#fff",
                        color: "#3b5998",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 13,
                    }}
                >
                    ← Anterior
                </button>
            )}
            {pages.map((link, i) => (
                <button
                    key={i}
                    disabled={!link.url}
                    onClick={() => link.url && router.visit(link.url)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #dddfe2",
                        background: link.active ? "#3b5998" : "#fff",
                        color: link.active ? "#fff" : "#1c1e21",
                        fontWeight: link.active ? 700 : 400,
                        cursor: link.url ? "pointer" : "default",
                        fontSize: 13,
                    }}
                >
                    {link.label}
                </button>
            ))}
            {links.next && (
                <button
                    onClick={() => router.visit(links.next)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #dddfe2",
                        background: "#fff",
                        color: "#3b5998",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 13,
                    }}
                >
                    Próxima →
                </button>
            )}
        </div>
    );
}

// ── Home ──────────────────────────────────────────────────────────────────────
export default function Home() {
    const { posts: initialPosts, categories, auth } = usePage().props;
    const [posts, setPosts] = useState(initialPosts?.data || []);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 715);
    const [showNewPost, setShowNewPost] = useState(false);

    // Lê o sort diretamente da URL para persistir após recarregamento do Inertia
    const activeSort =
        new URLSearchParams(window.location.search).get("sort") || "recent";

    function handleSort(sort) {
        const params = {};
        if (activeCategory) params.category = activeCategory;
        if (sort !== "recent") params.sort = sort;
        router.get("/", params, { preserveScroll: true });
    }

    function handleTag(slug) {
        router.get("/", { tag: slug }, { preserveScroll: false });
    }

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth <= 715);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    function handleCategory(slug) {
        setActiveCategory(slug);
        router.get("/", slug ? { category: slug } : {}, {
            preserveScroll: true,
        });
    }

    const openNewPost = () => {
        if (!auth?.user) {
            router.visit("/login");
            return;
        }
        setShowNewPost(true);
    };

    // Remove post deletado da lista local sem recarregar
    function handlePostDeleted(postId) {
        setPosts((ps) => ps.filter((p) => p.id !== postId));
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f0f2f5",
                fontFamily: "Helvetica Neue, Arial, sans-serif",
            }}
        >
            <Navbar isMobile={isMobile} onNewPost={openNewPost} />

            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    padding: "20px 16px",
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    {isMobile && (
                        <CategoryStories
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategory={handleCategory}
                        />
                    )}

                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 8,
                            border: "1px solid #dddfe2",
                            padding: "10px 16px",
                            marginBottom: 16,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13,
                                color: "#65676b",
                                fontWeight: 600,
                            }}
                        >
                            Ordenar por:
                        </span>
                        {[
                            { key: "recent", label: "🕐 Recentes" },
                            { key: "popular", label: "🔥 Populares" },
                            { key: "unanswered", label: "💬 Sem resposta" },
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => handleSort(opt.key)}
                                style={{
                                    border: "none",
                                    borderRadius: 20,
                                    padding: "5px 12px",
                                    background:
                                        activeSort === opt.key
                                            ? "#e7f0fd"
                                            : "none",
                                    color:
                                        activeSort === opt.key
                                            ? "#3b5998"
                                            : "#65676b",
                                    fontWeight:
                                        activeSort === opt.key ? 700 : 400,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    transition: "all .15s",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {posts.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: 60,
                                color: "#65676b",
                                background: "#fff",
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ fontSize: 48, marginBottom: 12 }}>
                                😕
                            </div>
                            <p>Nenhum post encontrado.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onOpenPost={(slug) =>
                                    router.visit(`/posts/${slug}`)
                                }
                                onDeleted={handlePostDeleted}
                            />
                        ))
                    )}
                    <Pagination links={initialPosts} />
                </div>

                {!isMobile && (
                    <Sidebar
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategory={handleCategory}
                        onNewPost={openNewPost}
                    />
                )}
            </div>

            {isMobile && (
                <button
                    onClick={openNewPost}
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 20,
                        zIndex: 200,
                        background: "#3b5998",
                        color: "#fff",
                        border: "none",
                        borderRadius: 50,
                        padding: "14px 20px",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(59,89,152,0.45)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span style={{ fontSize: 20 }}>✏️</span>Novo Post
                </button>
            )}

            {showNewPost && (
                <NewPostModal
                    categories={categories}
                    onClose={() => setShowNewPost(false)}
                />
            )}
        </div>
    );
}
