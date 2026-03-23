import { useState } from 'react';
import shared from '../../../styles/config/SharedCard.module.css';
import styles from '../../../styles/config/SecurityCard.module.css';

export function SecurityCard({
    email,
    emailVerified,
    resendingVerification,
    sendingPasswordReset,
    onSendPasswordReset,
    onDeleteAccount,
    deletingAccount,
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    async function handleDelete() {
        if (!deletePassword) {
            setDeleteError('Ingresá tu contraseña para confirmar.');
            return;
        }
        setDeleteError('');
        try {
            await onDeleteAccount(deletePassword);
        } catch (e) {
            setDeleteError(e?.message || 'Contraseña incorrecta.');
        }
    }

    function closeModal() {
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeleteError('');
    }

    return (
        <>
            <div className={`${shared.card} ${shared.cardFill}`}>
                <div className={shared.sectionTitle}>Seguridad</div>

                <div className={styles.stack}>
                    <div className={styles.statusBox}>
                        <div>
                            <div className={shared.inputLabel}>Estado del email</div>
                            <div className={styles.emailValue}>{email || 'Sin email configurado'}</div>
                        </div>
                        <div className={emailVerified ? styles.badgeSuccess : styles.badgeWarning}>
                            {emailVerified ? 'Verificado' : 'Pendiente'}
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <div className={styles.infoTitle}>Cambio de contraseña</div>
                        <div className={styles.infoText}>
                            Te enviaremos un enlace seguro a <strong>{email || 'tu email'}</strong> para que puedas definir una nueva contraseña.
                        </div>
                        <button
                            className={shared.primaryButton}
                            onClick={onSendPasswordReset}
                            disabled={!email || sendingPasswordReset}
                        >
                            {sendingPasswordReset ? 'Enviando enlace…' : 'Cambiar contraseña'}
                        </button>
                    </div>

                    {/* Zona de peligro */}
                    <div className={styles.dangerBox}>
                        <div className={styles.dangerTitle}>⚠️ Zona peligrosa</div>
                        <div className={styles.infoText}>
                            Eliminar la cuenta borra permanentemente todos los datos: clientes, autos, servicios, turnos e historial. <strong>Esta acción no se puede deshacer.</strong>
                        </div>
                        <button
                            className={styles.dangerButton}
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modal}>
                        <div className={styles.modalTitle}>Eliminar cuenta</div>
                        <p className={styles.modalText}>
                            Esta acción es <strong>irreversible</strong>. Se eliminarán todos los datos de tu lavadero.
                            Ingresá tu contraseña para confirmar.
                        </p>

                        <div className={shared.inputGroup} style={{ marginTop: 16 }}>
                            <div className={shared.inputLabel}>Contraseña</div>
                            <input
                                className={shared.input}
                                type="password"
                                placeholder="••••••••"
                                value={deletePassword}
                                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                                autoFocus
                            />
                        </div>

                        {deleteError && (
                            <div style={{ color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 8 }}>
                                {deleteError}
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button className={shared.ghostButton} onClick={closeModal} disabled={deletingAccount}>
                                Cancelar
                            </button>
                            <button
                                className={styles.dangerButton}
                                onClick={handleDelete}
                                disabled={deletingAccount || !deletePassword}
                            >
                                {deletingAccount ? 'Eliminando…' : 'Confirmar eliminación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}